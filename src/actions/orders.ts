"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { findMatchingDeliveryZone } from "@/lib/delivery-fee";
import { prisma } from "@/lib/prisma";

const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

export async function createManualOrder(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const customerName = String(formData.get("customerName") || "");
  const customerPhone = String(formData.get("customerPhone") || "");
  const itemName = String(formData.get("itemName") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const price = Number(formData.get("price") || 0);
  const deliveryAddress = String(formData.get("deliveryAddress") || "");
  const notes = String(formData.get("notes") || "");

  if (!customerPhone || !itemName) {
    throw new Error("Customer phone and item name are required.");
  }

  const safeQuantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;
  const safePrice = Number.isNaN(price) || price < 0 ? 0 : price;
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
  redirect("/dashboard/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "") as OrderStatus;

  if (!orderId || !ORDER_STATUSES.includes(status)) {
    throw new Error("Order ID and status are required.");
  }

  await prisma.order.update({
    where: {
      id: orderId,
      restaurantId: restaurant.id,
    },
    data: {
      status,
    },
  });

  revalidatePath("/dashboard/orders");
}

export async function confirmOrder(formData: FormData) {
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

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  revalidatePath("/dashboard/orders");
}
