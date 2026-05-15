import { getRestaurantBilling } from "@/lib/billing";
import { getPlanLimits } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

function getMonthStart() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthlyAIUsage(restaurantId: string) {
  const monthStart = getMonthStart();

  const subscription = await getRestaurantBilling(restaurantId);
  const plan = subscription?.plan || "starter";
  const limits = getPlanLimits(plan);

  const logs = await prisma.aIUsageLog.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: monthStart,
      },
    },
  });

  const totalEvents = logs.length;
  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);

  return {
    plan,
    limits,
    usage: {
      totalEvents,
      totalTokens,
      totalCost,
    },
  };
}

export async function canUseAI(restaurantId: string) {
  const monthly = await getMonthlyAIUsage(restaurantId);

  const eventsRemaining =
    monthly.usage.totalEvents < monthly.limits.monthlyAIEvents;

  const tokensRemaining =
    monthly.usage.totalTokens < monthly.limits.monthlyAITokens;

  return {
    allowed: eventsRemaining && tokensRemaining,
    reason: !eventsRemaining
      ? "Monthly AI event limit reached."
      : !tokensRemaining
        ? "Monthly AI token limit reached."
        : "",
    ...monthly,
  };
}
