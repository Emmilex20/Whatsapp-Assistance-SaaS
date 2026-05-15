"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { recommendedKnowledgePresets } from "@/lib/knowledge-presets";
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

export async function createRecommendedKnowledgeBaseItems() {
  const allowed = await checkPermission("manage_ai");

  if (!allowed) {
    return { error: "You do not have permission to manage AI knowledge." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const existingItems = await prisma.knowledgeBaseItem.findMany({
    where: { restaurantId: restaurant.id },
    select: { title: true },
  });

  const existingTitles = new Set(
    existingItems.map((item) => item.title.toLowerCase())
  );

  const presetsToCreate = recommendedKnowledgePresets.filter(
    (preset) => !existingTitles.has(preset.title.toLowerCase())
  );

  if (presetsToCreate.length === 0) {
    return {
      success: "Recommended knowledge already exists.",
    };
  }

  await prisma.knowledgeBaseItem.createMany({
    data: presetsToCreate.map((preset) => ({
      restaurantId: restaurant.id,
      title: preset.title,
      content: preset.content,
      category: preset.category,
      active: true,
    })),
  });

  revalidatePath("/dashboard/knowledge");
  revalidatePath("/dashboard/settings/ai/context");
  revalidatePath("/dashboard/final-check/pilot-launch");

  return {
    success: `${presetsToCreate.length} recommended knowledge item${
      presetsToCreate.length === 1 ? "" : "s"
    } saved.`,
  };
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
