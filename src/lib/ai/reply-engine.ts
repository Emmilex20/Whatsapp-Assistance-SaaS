import type { AIEventType } from "@/generated/prisma/client";
import { findPossibleDeliveryZoneMatches } from "@/lib/ai/delivery-match";
import { findPossibleMenuMatches } from "@/lib/ai/menu-match";
import { getAITextProvider } from "@/lib/ai/providers";
import { buildRestaurantAIContext } from "@/lib/ai/restaurant-context";
import { logAIUsage } from "@/lib/ai/usage-log";
import { prisma } from "@/lib/prisma";

type GenerateAIReplySuggestionParams = {
  restaurantId: string;
  conversationId: string;
  eventType?: Extract<AIEventType, "SUGGESTION" | "AUTO_REPLY">;
};

export function getAIModel() {
  const model = process.env.AI_MODEL || "gpt-5-mini";

  return model === "gpt-5.2-mini" ? "gpt-5-mini" : model;
}

export function getAIModelLogName() {
  const provider = getAITextProvider();

  return `${provider.name}:${getAIModel()}`;
}

export async function generateAIReplySuggestion({
  restaurantId,
  conversationId,
  eventType = "SUGGESTION",
}: GenerateAIReplySuggestionParams) {
  const enabled = process.env.AI_RESPONSES_ENABLED === "true";

  if (!enabled) {
    return {
      skipped: true,
      suggestion:
        "AI suggestions are disabled. Set AI_RESPONSES_ENABLED=true to test this feature.",
    };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      restaurantId,
    },
    include: {
      assignedTeamMember: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 30,
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: true,
        },
      },
    },
  });

  if (!conversation) {
    return {
      skipped: true,
      suggestion: "Conversation not found.",
    };
  }

  const customerOrders = await prisma.order.findMany({
    where: {
      restaurantId,
      customerPhone: conversation.customerPhone,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    include: {
      items: true,
    },
  });

  const context = await buildRestaurantAIContext(restaurantId);

  const messageHistory = conversation.messages
    .map((message) => `${message.senderType}: ${message.content}`)
    .join("\n");

  const latestCustomerMessage =
    [...conversation.messages]
      .reverse()
      .find((message) => message.senderType === "CUSTOMER")?.content || "";

  const possibleMenuMatches = await findPossibleMenuMatches({
    restaurantId,
    message: latestCustomerMessage,
  });

  const possibleDeliveryMatches = await findPossibleDeliveryZoneMatches({
    restaurantId,
    message: latestCustomerMessage,
  });

  const matchHints = `
Possible menu matches from latest customer message:
${
  possibleMenuMatches.length
    ? possibleMenuMatches
        .map((item) => `- ${item.name}: NGN ${item.price.toLocaleString()}`)
        .join("\n")
    : "None"
}

Possible delivery zone matches from latest customer message:
${
  possibleDeliveryMatches.length
    ? possibleDeliveryMatches
        .map(
          (zone) =>
            `- ${zone.area}: NGN ${zone.fee.toLocaleString()}${
              zone.estimatedTime ? `, ${zone.estimatedTime}` : ""
            }`
        )
        .join("\n")
    : "None"
}
`.trim();

  const activeOrders = conversation.orders.filter((order) =>
    ["NEW", "CONFIRMED", "PREPARING", "READY"].includes(order.status)
  );

  const activeOrderContext = activeOrders.length
    ? activeOrders
        .map((order) => {
          const items = order.items
            .map((item) => `${item.quantity}x ${item.name}`)
            .join(", ");

          return `
Order code: ${order.id.slice(-6).toUpperCase()}
Status: ${order.status}
Items: ${items || "No items"}
Items subtotal: NGN ${order.items
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toLocaleString()}
Delivery fee: NGN ${order.deliveryFee.toLocaleString()}
Total: NGN ${order.totalAmount.toLocaleString()}
Delivery address: ${order.deliveryAddress || "Not provided"}
Notes: ${order.notes || "None"}
Internal notes: ${order.internalNotes || "None"}
`.trim();
        })
        .join("\n\n")
    : "No active order in this conversation.";

  const customerHistory = customerOrders.length
    ? customerOrders
        .map((order) => {
          const items = order.items
            .map((item) => `${item.quantity}x ${item.name}`)
            .join(", ");

          return `#${order.id.slice(-6).toUpperCase()} - ${
            order.status
          } - ${items || "No items"} - NGN ${order.totalAmount.toLocaleString()}`;
        })
        .join("\n")
    : "No previous order history.";

  const conversationMeta = `
Customer name: ${conversation.customerName || "Unknown"}
Customer phone: ${conversation.customerPhone}
Conversation mode: ${conversation.status}
Workflow status: ${conversation.workflowStatus}
Priority: ${conversation.priority}
Tags: ${conversation.tags.length ? conversation.tags.join(", ") : "None"}
Internal conversation notes: ${conversation.internalNotes || "None"}
Assigned staff: ${
    conversation.assignedTeamMember?.name ||
    conversation.assignedTeamMember?.email ||
    "Unassigned"
  }
`.trim();

  const provider = getAITextProvider();
  const model = getAIModel();

  const instructions = `
You are ServeFlow AI, a careful WhatsApp assistant for a restaurant.

Write ONE short WhatsApp reply for staff to send.

Hard rules:
- Use only the provided restaurant, menu, delivery, order, and knowledge context.
- Do not invent prices, food items, delivery areas, discounts, payment details, or order status.
- If the customer asks for something unknown, say staff will confirm.
- If the conversation involves complaint, refund, sickness, fraud, legal threat, wrong order, or anger, suggest a calm human-takeover reply.
- If there is an active order, use the exact order status and total from context.
- If delivery address is missing for an order, ask for address.
- If delivery fee is missing or 0 and area is unknown, say delivery fee will be confirmed.
- Keep tone warm, simple, Nigerian-friendly, and professional.
- Do not mention that you are AI.
- Do not use markdown tables.
- Maximum 80 words.
`.trim();

  const input = `
Restaurant context:
${context}

Conversation metadata:
${conversationMeta}

Conversation history:
${messageHistory}

Context match hints:
${matchHints}

Active order context:
${activeOrderContext}

Customer previous order history:
${customerHistory}

Write the best next WhatsApp reply.
`.trim();

  const result = await provider.generateText({
    model,
    instructions,
    input,
  });

  const suggestion = result.text || "No suggestion generated.";

  await logAIUsage({
    restaurantId,
    conversationId,
    eventType,
    model: `${result.provider || provider.name}:${result.model}`,
    promptTokens: result.promptTokens,
    outputTokens: result.outputTokens,
    inputPreview: latestCustomerMessage,
    outputPreview: suggestion,
  });

  return {
    skipped: false,
    suggestion,
  };
}
