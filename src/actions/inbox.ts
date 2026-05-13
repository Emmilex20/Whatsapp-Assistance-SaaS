"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
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
  const conversationId = String(formData.get("conversationId") || "");
  const message = String(formData.get("message") || "").trim();

  if (!conversationId || !message) {
    throw new Error("Conversation ID and message are required.");
  }

  const { conversation } =
    await getConversationForCurrentRestaurant(conversationId);

  if (conversation.status !== "HUMAN_TAKEOVER") {
    throw new Error("Enable human takeover before sending a manual reply.");
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
}
