import { toFile } from "openai";
import { getOpenAIClient } from "@/lib/ai/client";
import { saveVoiceTranscriptionMessage } from "@/lib/conversations";
import { prisma } from "@/lib/prisma";

type DownloadWhatsAppAudioParams = {
  mediaId: string;
};

type TranscribeAudioParams = {
  audio: Buffer;
  mimeType?: string | null;
};

type ProcessIncomingVoiceNoteParams = {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  mediaId: string;
  mimeType?: string | null;
};

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const AUDIO_RETENTION_DAYS = 7;

function getWhatsAppApiVersion() {
  return process.env.WHATSAPP_API_VERSION || "v21.0";
}

function getAudioExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AUDIO_RETENTION_DAYS);
  return expiresAt;
}

function confidenceFromLogprobs(logprobs?: { logprob?: number }[]) {
  if (!logprobs?.length) return 82;

  const average =
    logprobs.reduce((sum, item) => sum + Number(item.logprob || -1), 0) /
    logprobs.length;
  const confidence = Math.exp(average) * 100;

  return Math.min(Math.max(Math.round(confidence), 0), 100);
}

function extensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) return "ogg";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("wav")) return "wav";
  return "ogg";
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function isAuthLikeError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("auth") ||
    normalized.includes("401") ||
    normalized.includes("403") ||
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden") ||
    normalized.includes("invalid token")
  );
}

export function voiceTranscriptionEnabled() {
  return process.env.VOICE_TRANSCRIPTION_ENABLED === "true";
}

export async function cleanupExpiredVoiceAudio() {
  await prisma.voiceTranscription.updateMany({
    where: {
      audioData: {
        not: null,
      },
      audioExpiresAt: {
        lt: new Date(),
      },
    },
    data: {
      audioData: null,
    },
  });
}

export async function downloadWhatsAppAudio({
  mediaId,
}: DownloadWhatsAppAudioParams) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!token) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured.");
  }

  const metadataResponse = await fetch(
    `https://graph.facebook.com/${getWhatsAppApiVersion()}/${mediaId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const metadata = await metadataResponse.json();

  if (!metadataResponse.ok) {
    const message = metadata?.error?.message || "Could not read audio media.";

    if (metadataResponse.status === 401 || metadataResponse.status === 403) {
      throw new Error(
        "WhatsApp media authentication failed. Refresh WHATSAPP_ACCESS_TOKEN in Vercel and confirm it has permission to read WhatsApp media."
      );
    }

    throw new Error(`WhatsApp media download failed: ${message}`);
  }

  const mediaUrl = String(metadata.url || "");
  const mimeType = String(metadata.mime_type || "");
  const fileSize = Number(metadata.file_size || 0);

  if (!mediaUrl.startsWith("https://")) {
    throw new Error("Invalid WhatsApp media URL.");
  }

  if (fileSize > MAX_AUDIO_BYTES) {
    throw new Error("Voice note is too large to transcribe safely.");
  }

  const audioResponse = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!audioResponse.ok) {
    if (audioResponse.status === 401 || audioResponse.status === 403) {
      throw new Error(
        "WhatsApp audio download authentication failed. Refresh WHATSAPP_ACCESS_TOKEN in Vercel."
      );
    }

    throw new Error("Could not download WhatsApp audio.");
  }

  const audio = Buffer.from(await audioResponse.arrayBuffer());

  if (audio.byteLength > MAX_AUDIO_BYTES) {
    throw new Error("Voice note is too large to store safely.");
  }

  return {
    audio,
    mimeType,
    size: audio.byteLength,
  };
}

export async function transcribeAudio({ audio, mimeType }: TranscribeAudioParams) {
  const client = getOpenAIClient();
  const model = process.env.VOICE_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
  const file = await toFile(
    audio,
    `whatsapp-voice.${extensionFromMimeType(mimeType)}`,
    {
      type: mimeType || "audio/ogg",
    }
  );

  let response;

  try {
    response = await client.audio.transcriptions.create({
      file,
      model,
      language: "en",
      prompt:
        "Transcribe restaurant customer WhatsApp voice notes. The speaker may use English, Nigerian Pidgin, Nigerian names, food names, addresses, and casual ordering phrases.",
      response_format: "json",
      include: ["logprobs"],
    });
  } catch (error) {
    const message = readableError(error);

    if (isAuthLikeError(message)) {
      throw new Error(
        "OpenAI transcription authentication failed. Check OPENAI_API_KEY in Vercel and redeploy."
      );
    }

    throw error;
  }

  const result = response as {
    text?: string;
    logprobs?: { logprob?: number }[];
  };

  return {
    transcript: String(result.text || "").trim(),
    confidence: confidenceFromLogprobs(result.logprobs),
    model,
  };
}

export function buildVoiceMessageContent(transcript: string) {
  return `Voice note transcript: ${transcript}`;
}

export function getVoiceAudioExpiry() {
  return getAudioExpiry();
}

async function getOrCreateVoiceConversation({
  restaurantId,
  customerPhone,
  customerName,
}: {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
}) {
  return prisma.conversation.upsert({
    where: {
      restaurantId_customerPhone: {
        restaurantId,
        customerPhone,
      },
    },
    update: {
      customerName,
      updatedAt: new Date(),
    },
    create: {
      restaurantId,
      customerPhone,
      customerName,
      status: "BOT_ACTIVE",
    },
  });
}

async function saveVoiceSystemMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) {
  return prisma.message.create({
    data: {
      conversationId,
      senderType: "CUSTOMER",
      content,
    },
  });
}

export async function processIncomingVoiceNote({
  restaurantId,
  customerPhone,
  customerName,
  mediaId,
  mimeType,
}: ProcessIncomingVoiceNoteParams) {
  await cleanupExpiredVoiceAudio();

  const conversation = await getOrCreateVoiceConversation({
    restaurantId,
    customerPhone,
    customerName,
  });

  const transcription = await prisma.voiceTranscription.create({
    data: {
      restaurantId,
      conversationId: conversation.id,
      whatsappMediaId: mediaId,
      mimeType,
      status: voiceTranscriptionEnabled() ? "PENDING" : "SKIPPED",
      audioExpiresAt: getVoiceAudioExpiry(),
    },
  });

  if (!voiceTranscriptionEnabled()) {
    const message = await saveVoiceSystemMessage({
      conversationId: conversation.id,
      content: "Voice note received. Transcription is disabled.",
    });

    await prisma.voiceTranscription.update({
      where: { id: transcription.id },
      data: { messageId: message.id },
    });

    return {
      conversation,
      transcript: "",
      skipped: true,
      reason: "VOICE_TRANSCRIPTION_ENABLED is false",
    };
  }

  try {
    const audio = await downloadWhatsAppAudio({
      mediaId,
    });

    await prisma.voiceTranscription.update({
      where: {
        id: transcription.id,
      },
      data: {
        mimeType: audio.mimeType || mimeType,
        audioData: audio.audio,
        audioSize: audio.size,
        status: "TRANSCRIBING",
      },
    });

    const result = await transcribeAudio({
      audio: audio.audio,
      mimeType: audio.mimeType || mimeType,
    });

    if (!result.transcript) {
      throw new Error("No transcript was returned.");
    }

    await prisma.voiceTranscription.update({
      where: {
        id: transcription.id,
      },
      data: {
        transcript: result.transcript,
        confidence: result.confidence,
        status: "COMPLETED",
      },
    });

    const saved = await saveVoiceTranscriptionMessage({
      restaurantId,
      customerPhone,
      customerName,
      transcriptionId: transcription.id,
      transcript: result.transcript,
    });

    return {
      conversation: saved.conversation,
      transcript: result.transcript,
      skipped: false,
      reason: "",
    };
  } catch (error) {
    const reason = readableError(error) || "Voice transcription failed.";
    const message = await saveVoiceSystemMessage({
      conversationId: conversation.id,
      content: `Voice note received. Transcription failed: ${reason}`,
    });

    await prisma.voiceTranscription.update({
      where: {
        id: transcription.id,
      },
      data: {
        messageId: message.id,
        status: "FAILED",
        error: reason,
      },
    });

    return {
      conversation,
      transcript: "",
      skipped: true,
      reason,
    };
  }
}
