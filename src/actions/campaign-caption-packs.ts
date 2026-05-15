"use server";

import { revalidatePath } from "next/cache";
import { generateCampaignCaptionPack } from "@/lib/ai/campaign-caption-pack";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { checkPermission } from "@/lib/require-permission";

export async function createCampaignCaptionPack(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const campaignId = String(formData.get("campaignId") || "");

  if (!campaignId) {
    return { error: "Campaign is required." };
  }

  try {
    const result = await generateCampaignCaptionPack({
      restaurantId: restaurant.id,
      campaignId,
    });

    revalidatePath(`/dashboard/campaigns/${campaignId}`);

    if (result.skipped) {
      return { error: result.error || "Caption pack skipped." };
    }

    return { success: "Caption pack generated." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate caption pack.",
    };
  }
}
