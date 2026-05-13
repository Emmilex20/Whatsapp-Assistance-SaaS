import { prisma } from "@/lib/prisma";

export async function getRestaurantBilling(restaurantId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      restaurantId,
    },
  });

  return subscription;
}

export function getPlanLabel(plan: string) {
  const labels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    premium: "Premium",
  };

  return labels[plan] || "Starter";
}

export function getPlanPrice(plan: string) {
  const prices: Record<string, string> = {
    starter: "₦10,000",
    growth: "₦25,000",
    premium: "₦50,000",
  };

  return prices[plan] || "₦10,000";
}
