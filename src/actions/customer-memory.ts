"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

function parseConfidence(value: FormDataEntryValue | null) {
  const confidence = Number(value || 70);

  if (!Number.isFinite(confidence)) return 70;

  return Math.min(Math.max(Math.round(confidence), 0), 100);
}

function revalidateCustomerMemory() {
  revalidatePath("/dashboard/customer-memory");
  revalidatePath("/dashboard/customer-memory/review");
  revalidatePath("/dashboard/settings/ai/context");
}

export async function createCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "").trim();
  const source = String(formData.get("source") || "Manual").trim();
  const confidence = parseConfidence(formData.get("confidence"));

  if (!customerPhone) return { error: "Customer phone is required." };
  if (!key) return { error: "Memory key is required." };
  if (!value) return { error: "Memory value is required." };
  if (!source) return { error: "Memory source is required." };

  await prisma.customerMemory.create({
    data: {
      restaurantId: restaurant.id,
      customerPhone,
      key,
      value,
      source,
      confidence,
      active: true,
      reviewStatus: "APPROVED",
    },
  });

  revalidateCustomerMemory();

  return { success: "Customer memory saved." };
}

export async function updateCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "").trim();
  const source = String(formData.get("source") || "Manual").trim();
  const confidence = parseConfidence(formData.get("confidence"));

  if (!id) return { error: "Memory is required." };
  if (!customerPhone) return { error: "Customer phone is required." };
  if (!key) return { error: "Memory key is required." };
  if (!value) return { error: "Memory value is required." };
  if (!source) return { error: "Memory source is required." };

  const memory = await prisma.customerMemory.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!memory) {
    return { error: "Customer memory not found." };
  }

  await prisma.customerMemory.update({
    where: {
      id: memory.id,
    },
    data: {
      customerPhone,
      key,
      value,
      source,
      confidence,
    },
  });

  revalidateCustomerMemory();

  return { success: "Customer memory updated." };
}

export async function archiveCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";

  const memory = await prisma.customerMemory.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!memory) {
    return { error: "Customer memory not found." };
  }

  await prisma.customerMemory.update({
    where: {
      id: memory.id,
    },
    data: {
      active: !active,
      reviewStatus: !active ? "APPROVED" : memory.reviewStatus,
    },
  });

  revalidateCustomerMemory();

  return {
    success: active ? "Customer memory archived." : "Customer memory restored.",
  };
}

export async function approveCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const memory = await prisma.customerMemory.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!memory) {
    return { error: "Customer memory not found." };
  }

  await prisma.customerMemory.update({
    where: {
      id: memory.id,
    },
    data: {
      reviewStatus: "APPROVED",
      active: true,
    },
  });

  revalidateCustomerMemory();

  return { success: "Customer memory approved." };
}

export async function rejectCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const memory = await prisma.customerMemory.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!memory) {
    return { error: "Customer memory not found." };
  }

  await prisma.customerMemory.update({
    where: {
      id: memory.id,
    },
    data: {
      reviewStatus: "REJECTED",
      active: false,
    },
  });

  revalidateCustomerMemory();

  return { success: "Customer memory rejected." };
}

export async function deleteCustomerMemory(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage customer memory." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const memory = await prisma.customerMemory.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!memory) {
    return { error: "Customer memory not found." };
  }

  await prisma.customerMemory.delete({
    where: {
      id: memory.id,
    },
  });

  revalidateCustomerMemory();

  return { success: "Customer memory deleted." };
}
