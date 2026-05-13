import { generateAIReplySuggestion } from "@/lib/ai/reply-engine";
import { getBlockedAIReason } from "@/lib/ai/safety";

type GenerateAIAutoReplyParams = {
  restaurantId: string;
  conversationId: string;
  latestCustomerMessage: string;
};

export async function generateAIAutoReply({
  restaurantId,
  conversationId,
  latestCustomerMessage,
}: GenerateAIAutoReplyParams) {
  const blockReason = getBlockedAIReason(latestCustomerMessage);

  if (blockReason) {
    return {
      blocked: true,
      reason: blockReason,
      reply: "",
    };
  }

  const result = await generateAIReplySuggestion({
    restaurantId,
    conversationId,
  });

  if (result.skipped) {
    return {
      blocked: true,
      reason: "AI responses are disabled.",
      reply: result.suggestion,
    };
  }

  return {
    blocked: false,
    reason: "",
    reply: result.suggestion,
  };
}
