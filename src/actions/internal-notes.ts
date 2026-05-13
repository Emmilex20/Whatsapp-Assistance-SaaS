"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export async function updateConversationInternalNotes(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const conversationId = String(formData.get("conversationId") || "");
  const internalNotes = String(formData.get("internalNotes") || "").trim();

  await prisma.conversation.update({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
    data: {
      internalNotes,
    },
  });

  revalidatePath("/dashboard/inbox");

  return {
    success: "Conversation note updated.",
  };
}

export async function updateOrderInternalNotes(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const orderId = String(formData.get("orderId") || "");
  const internalNotes = String(formData.get("internalNotes") || "").trim();

  await prisma.order.update({
    where: {
      id: orderId,
      restaurantId: restaurant.id,
    },
    data: {
      internalNotes,
    },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);

  return {
    success: "Order note updated.",
  };
}
