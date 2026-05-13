"use server";

import { revalidatePath } from "next/cache";
import type { ConversationPriority } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

const validPriorities: ConversationPriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

function parsePriority(value: FormDataEntryValue | null): ConversationPriority {
  const priority = String(value || "NORMAL").toUpperCase() as ConversationPriority;

  return validPriorities.includes(priority) ? priority : "NORMAL";
}

export async function updateConversationLabels(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const conversationId = String(formData.get("conversationId") || "");
  const priority = parsePriority(formData.get("priority"));
  const tagsInput = String(formData.get("tags") || "");

  if (!conversationId) {
    return { error: "Conversation is required." };
  }

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await prisma.conversation.update({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
    data: {
      priority,
      tags,
    },
  });

  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");

  return {
    success: "Conversation labels updated.",
  };
}
