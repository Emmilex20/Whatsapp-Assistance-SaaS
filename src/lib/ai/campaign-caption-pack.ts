import { getAITextProvider } from "@/lib/ai/providers";
import { prisma } from "@/lib/prisma";

type ParsedCaptionPack = {
  whatsappStatus?: string;
  instagramPost?: string;
  facebookPost?: string;
  hashtags?: string[];
};

function parseCaptionPack(raw: string): ParsedCaptionPack {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(json) as ParsedCaptionPack;

    return {
      whatsappStatus: String(parsed.whatsappStatus || ""),
      instagramPost: String(parsed.instagramPost || ""),
      facebookPost: String(parsed.facebookPost || ""),
      hashtags: Array.isArray(parsed.hashtags)
        ? parsed.hashtags.map((tag) => String(tag)).filter(Boolean).slice(0, 8)
        : [],
    };
  } catch {
    return {
      whatsappStatus: raw,
      instagramPost: raw,
      facebookPost: raw,
      hashtags: [],
    };
  }
}

export async function generateCampaignCaptionPack({
  restaurantId,
  campaignId,
}: {
  restaurantId: string;
  campaignId: string;
}) {
  if (process.env.AI_RESPONSES_ENABLED !== "true") {
    return {
      skipped: true,
      error: "AI captions are disabled.",
    };
  }

  const campaign = await prisma.promoCampaign.findFirst({
    where: {
      id: campaignId,
      restaurantId,
    },
    include: {
      restaurant: true,
      media: true,
    },
  });

  if (!campaign) {
    return {
      skipped: true,
      error: "Campaign not found.",
    };
  }

  const provider = getAITextProvider();

  const mediaCaptions = campaign.media
    .map((item) => item.caption || item.prompt)
    .join("\n\n");

  const result = await provider.generateText({
    model: process.env.AI_MODEL || "gpt-5-mini",
    instructions: `
You write short promo captions for Nigerian restaurants.

Return ONLY valid JSON with these keys:
{
  "whatsappStatus": "...",
  "instagramPost": "...",
  "facebookPost": "...",
  "hashtags": ["...", "..."]
}

Rules:
- Keep WhatsApp Status short and punchy.
- Instagram can be more exciting.
- Facebook should sound warm and clear.
- Include a call-to-action.
- Do not invent prices, discounts, phone numbers, or delivery promises unless campaign details mention them.
- Hashtags should be relevant and not more than 8.
`.trim(),
    input: `
Restaurant: ${campaign.restaurant.name}
Slogan: ${campaign.restaurant.brandSlogan || "Not provided"}
Tone: ${campaign.restaurant.brandTone || "Warm and friendly"}

Campaign title: ${campaign.title}
Goal: ${campaign.goal || "Not provided"}
Description: ${campaign.description || "Not provided"}
Dates: ${
      campaign.startDate ? campaign.startDate.toLocaleDateString() : "Not set"
    } to ${campaign.endDate ? campaign.endDate.toLocaleDateString() : "Not set"}

Existing media captions/prompts:
${mediaCaptions || "No media captions yet."}
`.trim(),
  });

  const parsed = parseCaptionPack(result.text || "{}");

  const pack = await prisma.campaignCaptionPack.create({
    data: {
      campaignId: campaign.id,
      whatsappStatus: parsed.whatsappStatus || "",
      instagramPost: parsed.instagramPost || "",
      facebookPost: parsed.facebookPost || "",
      hashtags: parsed.hashtags || [],
    },
  });

  return {
    skipped: false,
    pack,
  };
}
