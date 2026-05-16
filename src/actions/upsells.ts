"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

function revalidateUpsells() {
  revalidatePath("/dashboard/ai/upsells");
  revalidatePath("/dashboard/settings/ai");
}

export async function createUpsellRule(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI upsells." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const triggerItem = String(formData.get("triggerItem") || "").trim();
  const suggestedItem = String(formData.get("suggestedItem") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!triggerItem) return { error: "Trigger item is required." };
  if (!suggestedItem) return { error: "Suggested item is required." };
  if (!message) return { error: "Upsell message is required." };

  await prisma.upsellRule.create({
    data: {
      restaurantId: restaurant.id,
      triggerItem,
      suggestedItem,
      message,
      active: true,
    },
  });

  revalidateUpsells();

  return { success: "Upsell rule created." };
}

export async function toggleUpsellRule(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI upsells." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const rule = await prisma.upsellRule.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!rule) {
    return { error: "Upsell rule not found." };
  }

  await prisma.upsellRule.update({
    where: {
      id: rule.id,
    },
    data: {
      active: !rule.active,
    },
  });

  revalidateUpsells();

  return {
    success: rule.active ? "Upsell rule paused." : "Upsell rule resumed.",
  };
}

export async function deleteUpsellRule(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI upsells." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const rule = await prisma.upsellRule.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!rule) {
    return { error: "Upsell rule not found." };
  }

  await prisma.upsellRule.delete({
    where: {
      id: rule.id,
    },
  });

  revalidateUpsells();

  return { success: "Upsell rule deleted." };
}
