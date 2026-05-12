"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export async function createDeliveryZone(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const fee = Number(formData.get("fee") || 0);

  await prisma.deliveryZone.create({
    data: {
      restaurantId: restaurant.id,
      area: String(formData.get("area") || "").trim(),
      fee: Number.isNaN(fee) ? 0 : fee,
      estimatedTime: String(formData.get("estimatedTime") || "").trim(),
      active: true,
    },
  });

  revalidatePath("/dashboard/settings/delivery");
}

export async function deleteDeliveryZone(formData: FormData) {
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
