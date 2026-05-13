"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export async function assignConversation(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const conversationId = String(formData.get("conversationId") || "");
  const teamMemberId = String(formData.get("teamMemberId") || "");

  await prisma.conversation.update({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
    data: {
      assignedTeamMemberId: teamMemberId || null,
    },
  });

  revalidatePath("/dashboard/inbox");
}

export async function assignOrder(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const orderId = String(formData.get("orderId") || "");
  const teamMemberId = String(formData.get("teamMemberId") || "");

  await prisma.order.update({
    where: {
      id: orderId,
      restaurantId: restaurant.id,
    },
    data: {
      assignedTeamMemberId: teamMemberId || null,
    },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
}
