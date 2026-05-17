import { isLikelyAddress } from "@/lib/address-intent";
import { extractCustomerPreferences } from "@/lib/ai/customer-preference-extractor";
import { trackAcceptedUpsells } from "@/lib/ai/upsell-engine";
import { getCustomerMessageIntent } from "@/lib/customer-message-intent";
import { syncCustomerLoyaltyForCustomer } from "@/lib/customer-loyalty";
import { findMatchingDeliveryZone } from "@/lib/delivery-fee";
import { findBestMenuItemMatch } from "@/lib/menu-item-matcher";
import { extractSimpleOrderItem, isOrderIntent } from "@/lib/order-intent";
import { prisma } from "@/lib/prisma";

type HandleWhatsAppOrderParams = {
  restaurantId: string;
  conversationId: string;
  customerName?: string;
  customerPhone: string;
  message: string;
};

type OrderWithItems = {
  id: string;
  status: string;
  deliveryAddress: string | null;
  totalAmount: number;
  notes: string | null;
  internalNotes: string | null;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

function formatOrderItems(order: OrderWithItems) {
  if (!order.items.length) return "your order";

  return order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");
}

function buildActiveOrderReply(order: OrderWithItems) {
  const items = formatOrderItems(order);
  const addressLine = order.deliveryAddress
    ? `Delivery address: ${order.deliveryAddress}`
    : "Delivery address: not added yet";

  return `I still have your order for ${items}.

Status: ${order.status.toLowerCase()}
Total: NGN ${order.totalAmount.toLocaleString()}
${addressLine}

You can send your delivery address, ask for an update, or type "cancel order" if you want to cancel.`;
}

async function markConversationForHuman({
  restaurantId,
  conversationId,
  note,
}: {
  restaurantId: string;
  conversationId: string;
  note: string;
}) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      restaurantId,
    },
    select: {
      internalNotes: true,
    },
  });

  if (!conversation) return;

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      status: "HUMAN_TAKEOVER",
      priority: "HIGH",
      internalNotes: conversation.internalNotes
        ? `${conversation.internalNotes}\n${note}`
        : note,
    },
  });
}

export async function handleWhatsAppOrder({
  restaurantId,
  conversationId,
  customerName,
  customerPhone,
  message,
}: HandleWhatsAppOrderParams) {
  const existingActiveOrder = await prisma.order.findFirst({
    where: {
      restaurantId,
      conversationId,
      status: {
        in: ["NEW", "CONFIRMED", "PREPARING", "READY"],
      },
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingActiveOrder) {
    const intent = getCustomerMessageIntent(message);

    if (intent === "cancel_order") {
      if (["PREPARING", "READY"].includes(existingActiveOrder.status)) {
        await markConversationForHuman({
          restaurantId,
          conversationId,
          note: `Customer requested cancellation after preparation started: "${message}"`,
        });

        return {
          order: existingActiveOrder,
          reply: `I understand. Your order for ${formatOrderItems(
            existingActiveOrder
          )} is already ${existingActiveOrder.status.toLowerCase()}, so I have alerted a staff member to help with the cancellation.`,
        };
      }

      const cancelledOrder = await prisma.order.update({
        where: {
          id: existingActiveOrder.id,
        },
        data: {
          status: "CANCELLED",
          internalNotes: existingActiveOrder.internalNotes
            ? `${existingActiveOrder.internalNotes}\nCustomer cancelled via WhatsApp: "${message}"`
            : `Customer cancelled via WhatsApp: "${message}"`,
        },
        include: {
          items: true,
        },
      });

      return {
        order: cancelledOrder,
        reply: `No problem. I have cancelled your order for ${formatOrderItems(
          cancelledOrder
        )}.`,
      };
    }

    if (intent === "order_status") {
      return {
        order: existingActiveOrder,
        reply: buildActiveOrderReply(existingActiveOrder),
      };
    }

    if (intent === "change_order") {
      await markConversationForHuman({
        restaurantId,
        conversationId,
        note: `Customer wants to change an active order: "${message}"`,
      });

      return {
        order: existingActiveOrder,
        reply: `I understand you want to change your order for ${formatOrderItems(
          existingActiveOrder
        )}. I have alerted a staff member to help so the order is updated correctly.`,
      };
    }

    if (intent === "greeting") {
      return {
        order: existingActiveOrder,
        reply: `Hello. ${buildActiveOrderReply(existingActiveOrder)}`,
      };
    }

    if (intent === "thanks") {
      return {
        order: existingActiveOrder,
        reply:
          "You are welcome. I will keep your order here while the team continues with it.",
      };
    }
  }

  if (existingActiveOrder && !existingActiveOrder.deliveryAddress) {
    if (isLikelyAddress(message)) {
      const matchedZone = await findMatchingDeliveryZone({
        restaurantId,
        address: message,
      });

      const itemsSubtotal = existingActiveOrder.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const deliveryFee = matchedZone?.fee || 0;
      const newTotal = itemsSubtotal + deliveryFee;

      const updatedOrder = await prisma.order.update({
        where: {
          id: existingActiveOrder.id,
        },
        data: {
          deliveryAddress: message,
          deliveryFee,
          totalAmount: newTotal,
          notes: `${
            existingActiveOrder.notes || ""
          }\nDelivery address captured from WhatsApp: "${message}"${
            matchedZone ? `\nMatched delivery zone: ${matchedZone.area}` : ""
          }`,
        },
        include: {
          items: true,
        },
      });

      const orderItems = updatedOrder.items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(", ");

      extractCustomerPreferences({
        restaurantId,
        customerPhone,
        order: {
          itemNames: updatedOrder.items.map((item) => item.name),
          deliveryAddress: updatedOrder.deliveryAddress,
          notes: updatedOrder.notes,
        },
      }).catch((error) => {
        console.warn("Customer preference extraction skipped:", error);
      });

      syncCustomerLoyaltyForCustomer({
        restaurantId,
        customerPhone,
        customerName,
      }).catch((error) => {
        console.warn("Customer loyalty sync skipped:", error);
      });

      return {
        order: updatedOrder,
        reply: `Thank you. Your delivery address has been saved.

Order: ${orderItems}
Items subtotal: ₦${itemsSubtotal.toLocaleString()}
Delivery fee: ${
          deliveryFee
            ? `₦${deliveryFee.toLocaleString()}${
                matchedZone ? ` (${matchedZone.area})` : ""
              }`
            : "To be confirmed"
        }
Total: ₦${updatedOrder.totalAmount.toLocaleString()}
Address: ${updatedOrder.deliveryAddress}

A staff member will confirm your order shortly.`,
      };
    }

    return {
      order: existingActiveOrder,
      reply:
        `I have your order for ${formatOrderItems(existingActiveOrder)} open.

Please send your delivery address so we can continue. If you want to cancel, type "cancel order".`,
    };
  }

  if (existingActiveOrder) {
    return {
      order: existingActiveOrder,
      reply: buildActiveOrderReply(existingActiveOrder),
    };
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      available: true,
    },
  });

  const matchedMenuItem = findBestMenuItemMatch({
    message,
    menuItems,
  });
  const intent = getCustomerMessageIntent(message);

  if (intent === "price_check" && matchedMenuItem) {
    return {
      order: null,
      reply: `${matchedMenuItem.name} is NGN ${matchedMenuItem.price.toLocaleString()}.

If you would like to order it, just reply with "${matchedMenuItem.name}" or send your delivery address after ordering.`,
    };
  }

  if (!isOrderIntent(message) && !matchedMenuItem) {
    return null;
  }

  const extractedItem =
    matchedMenuItem?.name ||
    extractSimpleOrderItem(message) ||
    "Customer requested order";

  const order = await prisma.order.create({
    data: {
      restaurantId,
      conversationId,
      customerName,
      customerPhone,
      status: "NEW",
      totalAmount: matchedMenuItem?.price || 0,
      notes: `Created from WhatsApp message: "${message}"`,
      items: {
        create: {
          name: matchedMenuItem?.name || extractedItem,
          quantity: 1,
          price: matchedMenuItem?.price || 0,
        },
      },
    },
    include: {
      items: true,
    },
  });

  extractCustomerPreferences({
    restaurantId,
    customerPhone,
    message,
    order: {
      itemNames: order.items.map((item) => item.name),
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
    },
  }).catch((error) => {
    console.warn("Customer preference extraction skipped:", error);
  });

  trackAcceptedUpsells({
    restaurantId,
    conversationId,
    customerPhone,
    orderItems: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  }).catch((error) => {
    console.warn("Upsell acceptance tracking skipped:", error);
  });

  syncCustomerLoyaltyForCustomer({
    restaurantId,
    customerPhone,
    customerName,
  }).catch((error) => {
    console.warn("Customer loyalty sync skipped:", error);
  });

  return {
    order,
    reply: matchedMenuItem?.price
      ? `Great choice. I have started your order for ${
          matchedMenuItem.name
        } at ₦${matchedMenuItem.price.toLocaleString()}.

Please send your delivery address to continue.`
      : `Great. I have started your order request: "${extractedItem}".

Please send your delivery address so we can confirm availability and price.`,
  };
}
