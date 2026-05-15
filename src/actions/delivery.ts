"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { getRestaurantUsage, isAtLimit } from "@/lib/usage";

export async function createDeliveryZone(formData: FormData) {
  const allowed = await checkPermission("manage_settings");

  if (!allowed) {
    return { error: "You do not have permission to manage settings." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const usage = await getRestaurantUsage(restaurant.id);

  if (isAtLimit(usage.usage.deliveryZones, usage.limits.deliveryZones)) {
    return {
      error: "Delivery zone limit reached. Upgrade your plan to add more zones.",
    };
  }

  const area = String(formData.get("area") || "").trim();
  const fee = Number(formData.get("fee") || 0);

  if (!area) {
    return { error: "Delivery area is required." };
  }

  if (Number.isNaN(fee) || fee < 0) {
    return { error: "Valid delivery fee is required." };
  }

  await prisma.deliveryZone.create({
    data: {
      restaurantId: restaurant.id,
      area,
      fee,
      estimatedTime: String(formData.get("estimatedTime") || "").trim(),
      active: true,
    },
  });

  revalidatePath("/dashboard/settings/delivery");

  return {
    success: "Delivery zone added successfully.",
  };
}

export async function deleteDeliveryZone(formData: FormData) {
  const allowed = await checkPermission("manage_settings");

  if (!allowed) {
    throw new Error("You do not have permission to manage settings.");
  }

  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");

  if (!restaurant || !id) {
    throw new Error("Invalid request.");
  }

  await prisma.deliveryZone.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/settings/delivery");
}
