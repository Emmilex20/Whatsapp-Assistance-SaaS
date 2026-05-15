"use server";

import { revalidatePath } from "next/cache";
import { generateMediaCaption } from "@/lib/ai/caption-generator";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { checkPermission } from "@/lib/require-permission";

export async function generateCaptionForMedia(formData: FormData) {
  const allowed = await checkPermission("manage_media");

  if (!allowed) {
    return { error: "You do not have permission to manage media." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const mediaGenerationId = String(formData.get("mediaGenerationId") || "");

  if (!mediaGenerationId) {
    return { error: "Media generation is required." };
  }

  try {
    const result = await generateMediaCaption({
      restaurantId: restaurant.id,
      mediaGenerationId,
    });

    revalidatePath("/dashboard/media");

    return {
      success: result.skipped ? "" : "Caption generated.",
      caption: result.caption,
      skipped: result.skipped,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate caption.",
    };
  }
}
