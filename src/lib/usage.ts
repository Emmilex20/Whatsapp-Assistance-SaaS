import { getPlanLimits } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

export async function getRestaurantUsage(restaurantId: string) {
  const [subscription, menuItems, automations, deliveryZones, messages] =
    await Promise.all([
      prisma.subscription.findUnique({
        where: { restaurantId },
      }),
      prisma.menuItem.count({
        where: { restaurantId },
      }),
      prisma.automation.count({
        where: { restaurantId },
      }),
      prisma.deliveryZone.count({
        where: { restaurantId },
      }),
      prisma.message.count({
        where: {
          conversation: {
            restaurantId,
          },
        },
      }),
    ]);

  const plan = subscription?.plan || "starter";
  const limits = getPlanLimits(plan);

  return {
    plan,
    limits,
    usage: {
      menuItems,
      automations,
      deliveryZones,
      messages,
      agents: 1,
    },
  };
}

export function isAtLimit(current: number, limit: number) {
  return current >= limit;
}
