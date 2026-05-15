"use server";

import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { generateAIReplySuggestion } from "@/lib/ai/reply-engine";
import { canUseAI } from "@/lib/ai/usage-limits";

export async function generateConversationAISuggestion(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const conversationId = String(formData.get("conversationId") || "");

  if (!conversationId) {
    return { error: "Conversation is required." };
  }

  const aiLimit = await canUseAI(restaurant.id);

  if (!aiLimit.allowed) {
    return {
      error: `${aiLimit.reason} Upgrade your plan or wait until next month.`,
    };
  }

  try {
    const result = await generateAIReplySuggestion({
      restaurantId: restaurant.id,
      conversationId,
    });

    return {
      success: "AI suggestion generated.",
      suggestion: result.suggestion,
      skipped: result.skipped,
    };
  } catch (error) {
    console.error("AI suggestion error:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate AI suggestion.",
    };
  }
}
