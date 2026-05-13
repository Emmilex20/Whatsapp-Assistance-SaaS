"use server";

import { revalidatePath } from "next/cache";
import type { ConversationWorkflowStatus } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

const validWorkflowStatuses: ConversationWorkflowStatus[] = [
  "OPEN",
  "PENDING",
  "RESOLVED",
];

function parseWorkflowStatus(
  value: FormDataEntryValue | null
): ConversationWorkflowStatus {
  const workflowStatus = String(value || "OPEN").toUpperCase() as ConversationWorkflowStatus;

  return validWorkflowStatuses.includes(workflowStatus)
    ? workflowStatus
    : "OPEN";
}

export async function updateConversationWorkflowStatus(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const conversationId = String(formData.get("conversationId") || "");
  const workflowStatus = parseWorkflowStatus(formData.get("workflowStatus"));

  if (!conversationId) {
    return { error: "Conversation is required." };
  }

  await prisma.conversation.update({
    where: {
      id: conversationId,
      restaurantId: restaurant.id,
    },
    data: {
      workflowStatus,
      resolvedAt: workflowStatus === "RESOLVED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");

  return {
    success: "Conversation status updated.",
  };
}
