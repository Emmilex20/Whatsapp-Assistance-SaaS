import { prisma } from "@/lib/prisma";

export type LoyaltyTier = "bronze" | "silver" | "gold" | "vip";

const INACTIVE_RISK_DAYS = 30;

function daysSince(date: Date | null) {
  if (!date) return null;

  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateLoyaltyTier({
  totalOrders,
  totalSpent,
}: {
  totalOrders: number;
  totalSpent: number;
}): LoyaltyTier {
  if (totalOrders >= 15 || totalSpent >= 350000) return "vip";
  if (totalOrders >= 8 || totalSpent >= 150000) return "gold";
  if (totalOrders >= 3 || totalSpent >= 50000) return "silver";
  return "bronze";
}

export function calculateLoyaltyPoints({
  totalOrders,
  totalSpent,
}: {
  totalOrders: number;
  totalSpent: number;
}) {
  return Math.floor(totalSpent / 1000) + totalOrders * 10;
}

export function getLoyaltyRecommendation({
  loyaltyTier,
  inactiveRisk,
  totalOrders,
  totalSpent,
}: {
  loyaltyTier: string;
  inactiveRisk: boolean;
  totalOrders: number;
  totalSpent: number;
}) {
  if (inactiveRisk) {
    return {
      label: "Re-engage customer",
      message:
        "Send a friendly comeback offer or ask if they would like to reorder a favorite meal.",
    };
  }

  if (loyaltyTier === "vip" || totalOrders >= 15) {
    return {
      label: "Reward loyal customer",
      message:
        "Offer a VIP thank-you reward, priority delivery, or a free add-on on their next order.",
    };
  }

  if (loyaltyTier === "gold") {
    return {
      label: "Send discount",
      message:
        "Send a limited loyalty discount to keep this customer ordering regularly.",
    };
  }

  if (totalOrders >= 2 || totalSpent >= 30000) {
    return {
      label: "Encourage repeat order",
      message:
        "Suggest a small combo, drink, or free delivery threshold on the next order.",
    };
  }

  return {
    label: "Build relationship",
    message:
      "Thank them after their next order and invite them to try one recommended menu item.",
  };
}

export async function syncCustomerLoyaltyForCustomer({
  restaurantId,
  customerPhone,
  customerName,
}: {
  restaurantId: string;
  customerPhone: string;
  customerName?: string | null;
}) {
  if (!customerPhone) return null;

  const [orders, conversation] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        customerPhone,
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        customerName: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.conversation.findFirst({
      where: {
        restaurantId,
        customerPhone,
      },
      select: {
        customerName: true,
      },
    }),
  ]);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lastOrderAt = orders[0]?.createdAt || null;
  const loyaltyTier = calculateLoyaltyTier({ totalOrders, totalSpent });
  const points = calculateLoyaltyPoints({ totalOrders, totalSpent });
  const inactiveRisk =
    totalOrders > 0 && (daysSince(lastOrderAt) || 0) >= INACTIVE_RISK_DAYS;

  return prisma.customerLoyalty.upsert({
    where: {
      restaurantId_customerPhone: {
        restaurantId,
        customerPhone,
      },
    },
    create: {
      restaurantId,
      customerPhone,
      customerName:
        customerName || conversation?.customerName || orders[0]?.customerName,
      totalOrders,
      totalSpent,
      loyaltyTier,
      points,
      vip: loyaltyTier === "vip",
      inactiveRisk,
      lastOrderAt,
    },
    update: {
      customerName:
        customerName || conversation?.customerName || orders[0]?.customerName,
      totalOrders,
      totalSpent,
      loyaltyTier,
      points,
      vip: loyaltyTier === "vip",
      inactiveRisk,
      lastOrderAt,
    },
  });
}

export async function syncRestaurantCustomerLoyalty(restaurantId: string) {
  const [orders, conversations] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        customerPhone: true,
        customerName: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.conversation.findMany({
      where: {
        restaurantId,
      },
      select: {
        customerPhone: true,
        customerName: true,
      },
    }),
  ]);

  const conversationNames = new Map(
    conversations.map((conversation) => [
      conversation.customerPhone,
      conversation.customerName,
    ])
  );
  const grouped = new Map<
    string,
    {
      customerName?: string | null;
      totalOrders: number;
      totalSpent: number;
      lastOrderAt: Date | null;
    }
  >();

  for (const order of orders) {
    const existing = grouped.get(order.customerPhone) || {
      customerName: order.customerName || conversationNames.get(order.customerPhone),
      totalOrders: 0,
      totalSpent: 0,
      lastOrderAt: null,
    };

    existing.totalOrders += 1;
    existing.totalSpent += order.totalAmount;
    existing.lastOrderAt = existing.lastOrderAt || order.createdAt;
    grouped.set(order.customerPhone, existing);
  }

  await Promise.all(
    [...grouped.entries()].map(([customerPhone, stats]) => {
      const loyaltyTier = calculateLoyaltyTier({
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      });
      const points = calculateLoyaltyPoints({
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      });
      const inactiveRisk =
        stats.totalOrders > 0 &&
        (daysSince(stats.lastOrderAt) || 0) >= INACTIVE_RISK_DAYS;

      return prisma.customerLoyalty.upsert({
        where: {
          restaurantId_customerPhone: {
            restaurantId,
            customerPhone,
          },
        },
        create: {
          restaurantId,
          customerPhone,
          customerName: stats.customerName,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          loyaltyTier,
          points,
          vip: loyaltyTier === "vip",
          inactiveRisk,
          lastOrderAt: stats.lastOrderAt,
        },
        update: {
          customerName: stats.customerName,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          loyaltyTier,
          points,
          vip: loyaltyTier === "vip",
          inactiveRisk,
          lastOrderAt: stats.lastOrderAt,
        },
      });
    })
  );
}
