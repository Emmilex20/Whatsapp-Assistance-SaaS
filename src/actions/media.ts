"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { estimateMediaCost } from "@/lib/media/cost";
import { mediaPromptTemplates } from "@/lib/media/templates";
import { canGenerateMedia } from "@/lib/media/usage-limits";
import { prisma } from "@/lib/prisma";
import { generatePromoImage } from "@/lib/replicate/promo-image";
import { checkPermission } from "@/lib/require-permission";

export async function createPromoImage(formData: FormData) {
  const allowed = await checkPermission("manage_media");

  if (!allowed) {
    return { error: "You do not have permission to manage media." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const idea = String(formData.get("idea") || "").trim();
  const templateType = String(formData.get("templateType") || "").trim();
  const selectedTemplate = mediaPromptTemplates.find(
    (template) => template.id === templateType
  );

  if (!idea && !selectedTemplate) {
    return { error: "Promo idea or template is required." };
  }

  const mediaLimit = await canGenerateMedia(restaurant.id);

  if (!mediaLimit.allowed) {
    return {
      error: `${mediaLimit.reason} Upgrade your plan or wait until next month.`,
    };
  }

  const brandContext = `
Brand kit:
Primary color: ${restaurant.brandPrimaryColor || "Not provided"}
Secondary color: ${restaurant.brandSecondaryColor || "Not provided"}
Slogan: ${restaurant.brandSlogan || "Not provided"}
Tone: ${restaurant.brandTone || "Warm and friendly"}
Visual style: ${restaurant.brandVisualStyle || "Modern food advert"}
Logo URL: ${restaurant.brandLogoUrl || "Not provided"}
`.trim();

  const prompt = `
Create a premium realistic restaurant promo image for ${restaurant.name}.

${brandContext}

Template direction:
${selectedTemplate?.prompt || "Custom restaurant promo image"}

Restaurant promo idea:
${idea || "Use the template direction only."}

Style requirements:
Use the brand kit as visual guidance. Modern Nigerian food business advert,
appetizing food, clean layout, premium lighting, social media friendly,
professional composition, no distorted text, no fake logos.
`.trim();

  try {
    const result = await generatePromoImage(prompt);
    const model =
      process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";
    const estimatedCost = result.skipped ? 0 : estimateMediaCost(model);

    await prisma.mediaGeneration.create({
      data: {
        restaurantId: restaurant.id,
        prompt,
        model,
        outputUrl: result.outputUrl || null,
        status: result.skipped ? "SKIPPED" : "COMPLETED",
        estimatedCost,
        templateType: selectedTemplate?.id || null,
      },
    });

    revalidatePath("/dashboard/media");

    return {
      success: result.message,
      skipped: result.skipped,
      outputUrl: result.outputUrl,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate promo image.",
    };
  }
}

export async function deleteMediaGeneration(formData: FormData) {
  const allowed = await checkPermission("manage_media");

  if (!allowed) {
    return { error: "You do not have permission to manage media." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const generation = await prisma.mediaGeneration.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!generation) {
    return { error: "Media generation not found." };
  }

  await prisma.mediaGeneration.delete({
    where: { id },
  });

  revalidatePath("/dashboard/media");

  return { success: "Media generation deleted." };
}

export async function toggleFavoriteMediaGeneration(formData: FormData) {
  const allowed = await checkPermission("manage_media");

  if (!allowed) {
    return { error: "You do not have permission to manage media." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const generation = await prisma.mediaGeneration.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!generation) {
    return { error: "Media generation not found." };
  }

  await prisma.mediaGeneration.update({
    where: { id },
    data: {
      favorite: !generation.favorite,
    },
  });

  revalidatePath("/dashboard/media");

  return {
    success: generation.favorite
      ? "Removed from favorites."
      : "Added to favorites.",
  };
}
