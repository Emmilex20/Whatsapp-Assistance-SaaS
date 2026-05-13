"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export async function updateAIAutoReplySetting(formData: FormData) {
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
