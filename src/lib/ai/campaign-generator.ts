import { estimateAICost } from "@/lib/ai/cost";
import { getAITextProvider } from "@/lib/ai/providers";
import { logAIUsage } from "@/lib/ai/usage-log";
import { canUseAI } from "@/lib/ai/usage-limits";
import { prisma } from "@/lib/prisma";

export type GeneratedCampaignDraft = {
  title: string;
  caption: string;
  whatsappText: string;
  instagramText: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
};

type GenerateAICampaignDraftParams = {
  restaurantId: string;
  goal: string;
  targetAudience: string;
  promotionType: string;
  tone: string;
  platform: string;
};

function parseCampaignDraft(raw: string): GeneratedCampaignDraft {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(json) as Partial<GeneratedCampaignDraft>;

    return {
      title: String(parsed.title || "").trim(),
      caption: String(parsed.caption || "").trim(),
      whatsappText: String(parsed.whatsappText || "").trim(),
      instagramText: String(parsed.instagramText || "").trim(),
      hashtags: Array.isArray(parsed.hashtags)
        ? parsed.hashtags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
      callToAction: String(parsed.callToAction || "").trim(),
      imagePrompt: String(parsed.imagePrompt || "").trim(),
    };
  } catch {
    return {
      title: "Generated restaurant campaign",
      caption: raw,
      whatsappText: raw,
      instagramText: raw,
      hashtags: [],
      callToAction: "Order now",
      imagePrompt: raw,
    };
  }
}

export function estimateCampaignGeneratorCost() {
  return estimateAICost({
    model: process.env.AI_MODEL || "gpt-5-mini",
    promptTokens: 900,
    outputTokens: 450,
  });
}

export async function generateRestaurantCampaignDraft({
  restaurantId,
  goal,
  targetAudience,
  promotionType,
  tone,
  platform,
}: GenerateAICampaignDraftParams) {
  if (process.env.AI_RESPONSES_ENABLED !== "true") {
    return {
      skipped: true,
      error: "AI generation is disabled. Set AI_RESPONSES_ENABLED=true.",
    };
  }

  const aiLimit = await canUseAI(restaurantId);

  if (!aiLimit.allowed) {
    return {
      skipped: true,
      error: aiLimit.reason,
    };
  }

  const [restaurant, menuItems, deliveryZones] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
    }),
    prisma.menuItem.findMany({
      where: {
        restaurantId,
        available: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 20,
    }),
    prisma.deliveryZone.findMany({
      where: {
        restaurantId,
        active: true,
      },
      orderBy: { area: "asc" },
      take: 12,
    }),
  ]);

  if (!restaurant) {
    return {
      skipped: true,
      error: "Restaurant not found.",
    };
  }

  const provider = getAITextProvider();
  const model = process.env.AI_MODEL || "gpt-5-mini";

  const instructions = `
You are a campaign strategist and copywriter for Nigerian restaurants.

Return ONLY valid JSON with this exact shape:
{
  "title": "...",
  "caption": "...",
  "whatsappText": "...",
  "instagramText": "...",
  "hashtags": ["...", "..."],
  "callToAction": "...",
  "imagePrompt": "..."
}

Rules:
- Do not invent prices, discounts, delivery areas, phone numbers, or opening hours.
- If the offer details are broad, keep the copy broad.
- WhatsApp text must be short, direct, and friendly.
- Instagram text can be more expressive but still concise.
- Use Nigerian-friendly restaurant language.
- Hashtags must be relevant and not more than 10.
- Image prompt must be suitable for a premium realistic restaurant promo image.
- Avoid overpromising delivery time or availability.
`.trim();

  const input = `
Restaurant: ${restaurant.name}
Address: ${restaurant.address || "Not provided"}
Brand slogan: ${restaurant.brandSlogan || "Not provided"}
Brand tone: ${restaurant.brandTone || "Warm and friendly"}
Visual style: ${restaurant.brandVisualStyle || "Modern food advert"}

Available menu:
${
  menuItems.length
    ? menuItems
        .map(
          (item) =>
            `- ${item.name} (${item.category || "Menu"}): NGN ${item.price.toLocaleString()}`
        )
        .join("\n")
    : "No menu items saved."
}

Delivery zones:
${
  deliveryZones.length
    ? deliveryZones
        .map(
          (zone) =>
            `- ${zone.area}: NGN ${zone.fee.toLocaleString()}${
              zone.estimatedTime ? `, ${zone.estimatedTime}` : ""
            }`
        )
        .join("\n")
    : "No delivery zones saved."
}

Campaign goal: ${goal}
Target audience: ${targetAudience}
Promotion type: ${promotionType}
Tone: ${tone}
Primary platform: ${platform}
`.trim();

  const result = await provider.generateText({
    model,
    instructions,
    input,
  });

  const draft = parseCampaignDraft(result.text || "{}");
  const estimatedCost = estimateAICost({
    model: `${result.provider || provider.name}:${result.model}`,
    promptTokens: result.promptTokens,
    outputTokens: result.outputTokens,
  });

  await logAIUsage({
    restaurantId,
    eventType: "SUGGESTION",
    model: `${result.provider || provider.name}:${result.model}`,
    promptTokens: result.promptTokens,
    outputTokens: result.outputTokens,
    inputPreview: input,
    outputPreview: result.text,
  });

  return {
    skipped: false,
    draft,
    estimatedCost,
  };
}
