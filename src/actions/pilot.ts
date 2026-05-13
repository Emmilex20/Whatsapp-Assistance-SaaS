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
      checklist: {
        create: [
          { title: "Collect business details" },
          { title: "Add restaurant profile" },
          { title: "Add menu items" },
          { title: "Add delivery zones" },
          { title: "Create automation rules" },
          { title: "Test WhatsApp webhook" },
          { title: "Review inbox and order flow" },
          { title: "Confirm pilot pricing" },
        ],
      },
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
  revalidatePath(`/dashboard/pilots/${id}`);
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

export async function updatePilotFollowUp(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const nextContactAt = String(formData.get("nextContactAt") || "");
  const followUpNotes = String(formData.get("followUpNotes") || "");

  if (!id) {
    return { error: "Pilot client is required." };
  }

  await prisma.pilotClient.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      lastContactedAt: new Date(),
      nextContactAt: nextContactAt ? new Date(nextContactAt) : null,
      followUpNotes,
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${id}`);

  return { success: "Follow-up updated successfully." };
}

export async function togglePilotChecklistItem(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const pilotId = String(formData.get("pilotId") || "");
  const completed = String(formData.get("completed") || "") === "true";

  const item = await prisma.pilotChecklistItem.findFirst({
    where: {
      id,
      pilot: {
        id: pilotId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!item) {
    throw new Error("Checklist item not found.");
  }

  await prisma.pilotChecklistItem.update({
    where: { id },
    data: {
      completed: !completed,
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilotId}`);
}

export async function convertPilotToRestaurant(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const pilotId = String(formData.get("pilotId") || "");

  if (!pilotId) {
    return { error: "Pilot client is required." };
  }

  const pilot = await prisma.pilotClient.findFirst({
    where: {
      id: pilotId,
      restaurantId: restaurant.id,
    },
    include: {
      checklist: true,
    },
  });

  if (!pilot) {
    return { error: "Pilot client not found." };
  }

  await prisma.restaurant.update({
    where: {
      id: restaurant.id,
    },
    data: {
      name: pilot.businessName,
      whatsappNumber: pilot.phone,
      address: pilot.location || restaurant.address,
    },
  });

  await prisma.pilotClient.update({
    where: {
      id: pilot.id,
    },
    data: {
      status: "ACTIVE",
    },
  });

  await prisma.pilotChecklistItem.updateMany({
    where: {
      pilotId: pilot.id,
      title: {
        in: [
          "Collect business details",
          "Add restaurant profile",
          "Confirm pilot pricing",
        ],
      },
    },
    data: {
      completed: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilot.id}`);

  return {
    success: "Pilot converted into active restaurant setup.",
  };
}
