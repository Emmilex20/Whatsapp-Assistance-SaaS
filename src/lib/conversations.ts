import { prisma } from "@/lib/prisma";
import { extractCustomerPreferences } from "@/lib/ai/customer-preference-extractor";
import { detectAndEscalateComplaint } from "@/lib/complaint-detector";

type SaveIncomingMessageParams = {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  message: string;
};

type SaveBotMessageParams = {
  conversationId: string;
  message: string;
};

export async function saveIncomingCustomerMessage({
  restaurantId,
  customerPhone,
  customerName,
  message,
}: SaveIncomingMessageParams) {
  const conversation = await prisma.conversation.upsert({
    where: {
      restaurantId_customerPhone: {
        restaurantId,
        customerPhone,
      },
    },
    update: {
      customerName,
      updatedAt: new Date(),
    },
    create: {
      restaurantId,
      customerPhone,
      customerName,
      status: "BOT_ACTIVE",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "CUSTOMER",
      content: message,
    },
  });

  extractCustomerPreferences({
    restaurantId,
    customerPhone,
    message,
  }).catch((error) => {
    console.warn("Customer preference extraction skipped:", error);
  });

  const alert = await detectAndEscalateComplaint({
    restaurantId,
    conversationId: conversation.id,
    message,
  });

  if (!alert) return conversation;

  return prisma.conversation.findUniqueOrThrow({
    where: {
      id: conversation.id,
    },
  });
}

export async function saveBotMessage({
  conversationId,
  message,
}: SaveBotMessageParams) {
  return prisma.message.create({
    data: {
      conversationId,
      senderType: "BOT",
      content: message,
    },
  });
}
