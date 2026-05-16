"use server";

import { revalidatePath } from "next/cache";
import {
  generateRestaurantCampaignDraft,
  GeneratedCampaignDraft,
} from "@/lib/ai/campaign-generator";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { estimateMediaCost } from "@/lib/media/cost";
import { canGenerateMedia } from "@/lib/media/usage-limits";
import { prisma } from "@/lib/prisma";
import { generatePromoImage } from "@/lib/replicate/promo-image";
import { checkPermission } from "@/lib/require-permission";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function parseHashtags(value: string) {
  return value
    .split(/[\n,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .slice(0, 10);
}

function buildCampaignDescription({
  caption,
  platform,
  promotionType,
  targetAudience,
  callToAction,
}: {
  caption: string;
  platform: string;
  promotionType: string;
  targetAudience: string;
  callToAction: string;
}) {
  return `
${caption}

Platform: ${platform}
Promotion type: ${promotionType}
Target audience: ${targetAudience}
Call to action: ${callToAction}
`.trim();
}

export async function generateAICampaignDraft(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const goal = getText(formData, "goal");
  const targetAudience = getText(formData, "targetAudience");
  const promotionType = getText(formData, "promotionType");
  const tone = getText(formData, "tone");
  const platform = getText(formData, "platform");

  if (!goal) return { error: "Campaign goal is required." };
  if (!targetAudience) return { error: "Target audience is required." };
  if (!promotionType) return { error: "Promotion type is required." };
  if (!tone) return { error: "Tone is required." };
  if (!platform) return { error: "Platform is required." };

  try {
    const result = await generateRestaurantCampaignDraft({
      restaurantId: restaurant.id,
      goal,
      targetAudience,
      promotionType,
      tone,
      platform,
    });

    if (result.skipped) {
      return { error: result.error || "Campaign generation skipped." };
    }

    return {
      success: "Campaign draft generated.",
      draft: result.draft,
      estimatedCost: result.estimatedCost || 0,
      input: {
        goal,
        targetAudience,
        promotionType,
        tone,
        platform,
      },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate campaign draft.",
    };
  }
}

export async function saveGeneratedCampaign(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const title = getText(formData, "title");
  const caption = getText(formData, "caption");
  const whatsappText = getText(formData, "whatsappText");
  const instagramText = getText(formData, "instagramText");
  const hashtags = parseHashtags(getText(formData, "hashtags"));
  const callToAction = getText(formData, "callToAction");
  const imagePrompt = getText(formData, "imagePrompt");
  const goal = getText(formData, "goal");
  const targetAudience = getText(formData, "targetAudience");
  const promotionType = getText(formData, "promotionType");
  const platform = getText(formData, "platform");
  const generateImage = String(formData.get("generateImage") || "") === "on";

  if (!title) return { error: "Campaign title is required." };
  if (!caption) return { error: "Campaign caption is required." };
  if (!whatsappText) return { error: "WhatsApp text is required." };
  if (!instagramText) return { error: "Instagram text is required." };

  let mediaResult:
    | {
        outputUrl?: string;
        skipped?: boolean;
        message?: string;
        estimatedCost?: number;
      }
    | null = null;

  if (generateImage) {
    const mediaAllowed = await checkPermission("manage_media");

    if (!mediaAllowed) {
      return { error: "You do not have permission to generate media." };
    }

    const mediaLimit = await canGenerateMedia(restaurant.id);

    if (!mediaLimit.allowed) {
      return { error: mediaLimit.reason };
    }

    const result = await generatePromoImage(
      imagePrompt ||
        `Premium realistic restaurant promo image for ${restaurant.name}: ${caption}`
    );
    const model =
      process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";

    mediaResult = {
      ...result,
      estimatedCost: result.skipped ? 0 : estimateMediaCost(model),
    };
  }

  const campaign = await prisma.promoCampaign.create({
    data: {
      restaurantId: restaurant.id,
      title,
      goal: goal || callToAction || null,
      description: buildCampaignDescription({
        caption,
        platform,
        promotionType,
        targetAudience,
        callToAction,
      }),
      captionPacks: {
        create: {
          whatsappStatus: whatsappText,
          instagramPost: instagramText,
          facebookPost: caption,
          hashtags,
        },
      },
      media:
        generateImage && mediaResult
          ? {
              create: {
                restaurantId: restaurant.id,
                prompt:
                  imagePrompt ||
                  `Premium realistic restaurant promo image for ${restaurant.name}: ${caption}`,
                model:
                  process.env.REPLICATE_IMAGE_MODEL ||
                  "black-forest-labs/flux-schnell",
                outputUrl: mediaResult.outputUrl || null,
                status: mediaResult.skipped ? "SKIPPED" : "COMPLETED",
                estimatedCost: mediaResult.estimatedCost || 0,
                templateType: "ai-campaign-generator",
                caption,
              },
            }
          : undefined,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaign.id}`);
  revalidatePath("/dashboard/media");

  return {
    success: generateImage
      ? `Campaign saved. ${mediaResult?.message || "Promo image processed."}`
      : "Campaign saved.",
    campaignId: campaign.id,
  };
}

export type GeneratedCampaignActionState = {
  success?: string;
  error?: string;
  draft?: GeneratedCampaignDraft;
  estimatedCost?: number;
  input?: {
    goal: string;
    targetAudience: string;
    promotionType: string;
    tone: string;
    platform: string;
  };
};
