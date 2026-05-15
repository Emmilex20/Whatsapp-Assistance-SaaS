import type { AIEventType } from "@/generated/prisma/client";
import { estimateAICost } from "@/lib/ai/cost";
import { prisma } from "@/lib/prisma";

type LogAIUsageParams = {
  restaurantId: string;
  conversationId?: string;
  eventType: AIEventType;
  model: string;
  promptTokens?: number;
  outputTokens?: number;
  inputPreview?: string;
  outputPreview?: string;
  blockedReason?: string;
};

export async function logAIUsage({
  restaurantId,
  conversationId,
  eventType,
  model,
  promptTokens = 0,
  outputTokens = 0,
  inputPreview,
  outputPreview,
  blockedReason,
}: LogAIUsageParams) {
  const totalTokens = promptTokens + outputTokens;

  const estimatedCost = estimateAICost({
    model,
    promptTokens,
    outputTokens,
  });

  await prisma.aIUsageLog.create({
    data: {
      restaurantId,
      conversationId,
      eventType,
      model,
      promptTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      inputPreview: inputPreview?.slice(0, 500),
      outputPreview: outputPreview?.slice(0, 500),
      blockedReason: blockedReason?.slice(0, 500),
    },
  });
}
