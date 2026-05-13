import { getPlanLimits } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

export async function getRestaurantUsage(restaurantId: string) {
  const [subscription, menuItems, automations, deliveryZones, messages, agents] =
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
      prisma.teamMember.count({
        where: { restaurantId },
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
      agents,
    },
  };
}

export function isAtLimit(current: number, limit: number) {
  return current >= limit;
}
