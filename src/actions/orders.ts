"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { findMatchingDeliveryZone } from "@/lib/delivery-fee";
import { getOrderStatusMessage } from "@/lib/order-status-message";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { safeSendWhatsAppText } from "@/lib/safe-whatsapp";

const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

export async function createManualOrder(formData: FormData) {
  const allowed = await checkPermission("manage_orders");

  if (!allowed) {
    return { error: "You do not have permission to manage orders." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const customerName = String(formData.get("customerName") || "");
  const customerPhone = String(formData.get("customerPhone") || "");
  const itemName = String(formData.get("itemName") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const price = Number(formData.get("price") || 0);
  const deliveryAddress = String(formData.get("deliveryAddress") || "");
  const notes = String(formData.get("notes") || "");

  if (!customerPhone) {
    return { error: "Customer phone is required." };
  }

  if (!itemName) {
    return { error: "Item name is required." };
  }

  const safeQuantity = Number.isNaN(quantity) ? 1 : quantity;
  const safePrice = Number.isNaN(price) ? 0 : price;
  const itemsSubtotal = safeQuantity * safePrice;

  const matchedZone = deliveryAddress
    ? await findMatchingDeliveryZone({
        restaurantId: restaurant.id,
        address: deliveryAddress,
      })
    : null;

  const deliveryFee = matchedZone?.fee || 0;
  const totalAmount = itemsSubtotal + deliveryFee;

  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryFee,
      notes,
      totalAmount,
      status: "NEW",
      items: {
        create: {
          name: itemName,
          quantity: safeQuantity,
          price: safePrice,
        },
      },
    },
  });

  revalidatePath("/dashboard/orders");

  return { success: "Order created successfully." };
}

export async function updateOrderStatus(formData: FormData) {
  const allowed = await checkPermission("manage_orders");

  if (!allowed) {
    throw new Error("You do not have permission to manage orders.");
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "") as OrderStatus;

  if (!orderId || !ORDER_STATUSES.includes(status)) {
    throw new Error("Order ID and status are required.");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId: restaurant.id,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status,
    },
  });

  const message = getOrderStatusMessage({
    status,
    restaurantName: restaurant.name,
    orderCode: updatedOrder.id.slice(-6).toUpperCase(),
  });

  if (order.conversationId) {
    await prisma.message.create({
      data: {
        conversationId: order.conversationId,
        senderType: "HUMAN",
        content: message,
      },
    });
  }

  await safeSendWhatsAppText({
    to: order.customerPhone,
    message,
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");

  if (order.conversationId) {
    revalidatePath(`/dashboard/customers/${order.conversationId}`);
  }
}

export async function confirmOrder(formData: FormData) {
  const allowed = await checkPermission("manage_orders");

  if (!allowed) {
    throw new Error("You do not have permission to manage orders.");
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const orderId = String(formData.get("orderId") || "");

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId: restaurant.id,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  const message = getOrderStatusMessage({
    status: "CONFIRMED",
    restaurantName: restaurant.name,
    orderCode: updatedOrder.id.slice(-6).toUpperCase(),
  });

  if (order.conversationId) {
    await prisma.message.create({
      data: {
        conversationId: order.conversationId,
        senderType: "HUMAN",
        content: message,
      },
    });
  }

  await safeSendWhatsAppText({
    to: order.customerPhone,
    message,
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");

  if (order.conversationId) {
    revalidatePath(`/dashboard/customers/${order.conversationId}`);
  }
}
