import { isLikelyAddress } from "@/lib/address-intent";
import { extractCustomerPreferences } from "@/lib/ai/customer-preference-extractor";
import { trackAcceptedUpsells } from "@/lib/ai/upsell-engine";
import { findMatchingDeliveryZone } from "@/lib/delivery-fee";
import { extractSimpleOrderItem, isOrderIntent } from "@/lib/order-intent";
import { prisma } from "@/lib/prisma";

type HandleWhatsAppOrderParams = {
  restaurantId: string;
  conversationId: string;
  customerName?: string;
  customerPhone: string;
  message: string;
};

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
        "Please send your delivery address so we can continue with your order.",
    };
  }

  if (existingActiveOrder) {
    return {
      order: existingActiveOrder,
      reply:
        "Your order is already in progress. A staff member will confirm or update you shortly.",
    };
  }

  if (!isOrderIntent(message)) {
    return null;
  }

  const extractedItem =
    extractSimpleOrderItem(message) || "Customer requested order";

  const menuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      available: true,
    },
  });

  const normalizedMessage = message.toLowerCase();
  const matchedMenuItem = menuItems.find((item) =>
    normalizedMessage.includes(item.name.toLowerCase())
  );

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
