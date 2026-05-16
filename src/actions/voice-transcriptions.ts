"use server";

import { revalidatePath } from "next/cache";
import { buildVoiceMessageContent } from "@/lib/voice-transcription";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

function parseConfidence(value: FormDataEntryValue | null) {
  const confidence = Number(value || 90);

  if (!Number.isFinite(confidence)) return 90;

  return Math.min(Math.max(Math.round(confidence), 0), 100);
}

export async function updateVoiceTranscription(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    return { error: "You do not have permission to update transcriptions." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const correctedText = String(formData.get("correctedText") || "").trim();
  const confidence = parseConfidence(formData.get("confidence"));

  if (!id) return { error: "Transcription is required." };
  if (!correctedText) return { error: "Corrected transcript is required." };

  const transcription = await prisma.voiceTranscription.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    include: {
      message: true,
    },
  });

  if (!transcription) {
    return { error: "Voice transcription not found." };
  }

  await prisma.voiceTranscription.update({
    where: {
      id: transcription.id,
    },
    data: {
      correctedText,
      confidence,
      status: "CORRECTED",
    },
  });

  if (transcription.message) {
    await prisma.message.update({
      where: {
        id: transcription.message.id,
      },
      data: {
        content: buildVoiceMessageContent(correctedText),
      },
    });
  }

  revalidatePath("/dashboard/inbox");

  return { success: "Voice transcript updated." };
}

export async function cleanupVoiceTranscriptionAudio(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    return { error: "You do not have permission to clean transcriptions." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const transcription = await prisma.voiceTranscription.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!transcription) {
    return { error: "Voice transcription not found." };
  }

  await prisma.voiceTranscription.update({
    where: {
      id: transcription.id,
    },
    data: {
      audioData: null,
    },
  });

  revalidatePath("/dashboard/inbox");

  return { success: "Stored voice audio removed." };
}
