import {
  generateAIReplySuggestion,
  getAIModelLogName,
} from "@/lib/ai/reply-engine";
import { getBlockedAIReason } from "@/lib/ai/safety";
import { logAIUsage } from "@/lib/ai/usage-log";
import { canUseAI } from "@/lib/ai/usage-limits";

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
    await logAIUsage({
      restaurantId,
      conversationId,
      eventType: "BLOCKED_AUTO_REPLY",
      model: getAIModelLogName(),
      inputPreview: latestCustomerMessage,
      blockedReason: blockReason,
    });

    return {
      blocked: true,
      reason: blockReason,
      reply: "",
    };
  }

  const aiLimit = await canUseAI(restaurantId);

  if (!aiLimit.allowed) {
    await logAIUsage({
      restaurantId,
      conversationId,
      eventType: "BLOCKED_AUTO_REPLY",
      model: getAIModelLogName(),
      inputPreview: latestCustomerMessage,
      blockedReason: aiLimit.reason,
    });

    return {
      blocked: true,
      reason: aiLimit.reason,
      reply: "",
    };
  }

  const result = await generateAIReplySuggestion({
    restaurantId,
    conversationId,
    eventType: "AUTO_REPLY",
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
