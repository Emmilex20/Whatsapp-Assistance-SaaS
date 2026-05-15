import { getRestaurantBilling } from "@/lib/billing";
import { getPlanLimits } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";
import { getRestaurantTrialAccessStatus } from "@/lib/trial-access";

function getMonthStart() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthlyMediaUsage(restaurantId: string) {
  const subscription = await getRestaurantBilling(restaurantId);
  const plan = subscription?.plan || "starter";
  const limits = getPlanLimits(plan);

  const generations = await prisma.mediaGeneration.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: getMonthStart(),
      },
    },
  });

  const totalGenerations = generations.length;
  const totalCost = generations.reduce(
    (sum, item) => sum + item.estimatedCost,
    0
  );

  return {
    plan,
    limits,
    usage: {
      totalGenerations,
      totalCost,
    },
  };
}

export async function canGenerateMedia(restaurantId: string) {
  const trialAccess = await getRestaurantTrialAccessStatus(restaurantId);

  if (trialAccess && !trialAccess.allowed) {
    return {
      allowed: false,
      reason:
        "Your 3-day free trial has ended. Subscribe to continue using ServeFlow.",
      plan: "starter",
      limits: getPlanLimits("starter"),
      usage: {
        totalGenerations: 0,
        totalCost: 0,
      },
    };
  }

  const monthly = await getMonthlyMediaUsage(restaurantId);

  const generationsRemaining =
    monthly.usage.totalGenerations <
    monthly.limits.monthlyMediaGenerations;

  const costRemaining =
    monthly.usage.totalCost < monthly.limits.monthlyMediaCostLimit;

  return {
    allowed: generationsRemaining && costRemaining,
    reason: !generationsRemaining
      ? "Monthly media generation limit reached."
      : !costRemaining
        ? "Monthly media cost limit reached."
        : "",
    ...monthly,
  };
}
