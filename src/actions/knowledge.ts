"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { checkPermission } from "@/lib/require-permission";

export async function createKnowledgeBaseItem(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI knowledge." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();

  if (!title) return { error: "Title is required." };
  if (!content) return { error: "Content is required." };

  await prisma.knowledgeBaseItem.create({
    data: {
      restaurantId: restaurant.id,
      title,
      content,
      category,
      active: true,
    },
  });

  revalidatePath("/dashboard/knowledge");

  return { success: "Knowledge item added." };
}

export async function deleteKnowledgeBaseItem(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    throw new Error("You do not have permission to manage AI knowledge.");
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");

  await prisma.knowledgeBaseItem.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/knowledge");
}

export async function toggleKnowledgeBaseItem(formData: FormData) {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    throw new Error("You do not have permission to manage AI knowledge.");
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";

  await prisma.knowledgeBaseItem.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      active: !active,
    },
  });

  revalidatePath("/dashboard/knowledge");
}
