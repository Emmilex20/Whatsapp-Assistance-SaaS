import { getMonthlyAIUsage } from "@/lib/ai/usage-limits";
import { prisma } from "@/lib/prisma";

export async function getAIUsageAnalytics(restaurantId: string) {
  const logs = await prisma.aIUsageLog.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      conversation: true,
    },
  });
  const monthly = await getMonthlyAIUsage(restaurantId);

  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);

  const suggestions = logs.filter(
    (log) => log.eventType === "SUGGESTION"
  ).length;
  const autoReplies = logs.filter(
    (log) => log.eventType === "AUTO_REPLY"
  ).length;
  const blocked = logs.filter(
    (log) => log.eventType === "BLOCKED_AUTO_REPLY"
  ).length;

  return {
    logs,
    monthly,
    stats: {
      totalEvents: logs.length,
      totalTokens,
      totalCost,
      suggestions,
      autoReplies,
      blocked,
    },
  };
}
