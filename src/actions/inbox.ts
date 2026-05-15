"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { safeSendWhatsAppText } from "@/lib/safe-whatsapp";

async function getConversationForCurrentRestaurant(conversationId: string) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  return { conversation, restaurant };
}

export async function enableHumanTakeover(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    throw new Error("You do not have permission to manage inbox.");
  }

  const conversationId = String(formData.get("conversationId") || "");

  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  const { conversation } =
    await getConversationForCurrentRestaurant(conversationId);

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { status: "HUMAN_TAKEOVER" },
  });

  revalidatePath("/dashboard/inbox");
}

export async function resumeBotAutomation(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    throw new Error("You do not have permission to manage inbox.");
  }

  const conversationId = String(formData.get("conversationId") || "");

  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  const { conversation } =
    await getConversationForCurrentRestaurant(conversationId);

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { status: "BOT_ACTIVE" },
  });

  revalidatePath("/dashboard/inbox");
}

export async function sendHumanReply(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    return { error: "You do not have permission to manage inbox." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const conversationId = String(formData.get("conversationId") || "");
  const message = String(formData.get("message") || "").trim();

  if (!conversationId || !message) {
    return { error: "Conversation ID and message are required." };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
  });

  if (!conversation) {
    return { error: "Conversation not found." };
  }

  if (conversation.status !== "HUMAN_TAKEOVER") {
    return { error: "Enable human takeover before sending a manual reply." };
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "HUMAN",
      content: message,
    },
  });

  await safeSendWhatsAppText({
    to: conversation.customerPhone,
    message,
  });

  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");

  return { success: "Reply sent successfully." };
}
