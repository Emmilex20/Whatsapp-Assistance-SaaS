"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

export async function updateAIAutoReplySetting(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI settings." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const enabled = String(formData.get("enabled") || "") === "true";

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      aiAutoReplyEnabled: enabled,
    },
  });

  revalidatePath("/dashboard/settings/ai");

  return {
    success: enabled
      ? "AI auto-reply enabled."
      : "AI auto-reply disabled.",
  };
}

export async function updateAIUpsellSetting(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI settings." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const enabled = String(formData.get("enabled") || "") === "true";

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      aiUpsellsEnabled: enabled,
    },
  });

  revalidatePath("/dashboard/settings/ai");
  revalidatePath("/dashboard/ai/upsells");

  return {
    success: enabled ? "AI upsells enabled." : "AI upsells disabled.",
  };
}
