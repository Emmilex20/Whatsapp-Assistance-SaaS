"use server";

import { revalidatePath } from "next/cache";
import type { PilotStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export async function createPilotClient(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const businessName = String(formData.get("businessName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!businessName) return { error: "Business name is required." };
  if (!phone) return { error: "Phone number is required." };

  await prisma.pilotClient.create({
    data: {
      restaurantId: restaurant.id,
      businessName,
      phone,
      contactName: String(formData.get("contactName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      instagram: String(formData.get("instagram") || "").trim(),
      businessType: String(formData.get("businessType") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      status: "NEW",
    },
  });

  revalidatePath("/dashboard/pilots");

  return { success: "Pilot client added successfully." };
}

export async function updatePilotStatus(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as PilotStatus;

  await prisma.pilotClient.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: { status },
  });

  revalidatePath("/dashboard/pilots");
}

export async function deletePilotClient(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");

  await prisma.pilotClient.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/pilots");
}
