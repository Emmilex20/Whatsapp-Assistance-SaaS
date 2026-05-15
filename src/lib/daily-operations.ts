import { prisma } from "@/lib/prisma";

export async function getDailyOperationsSummary(restaurantId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [messages, orders, postedCampaignPosts, overdueCampaignPosts] =
    await Promise.all([
      prisma.message.count({
        where: {
          createdAt: { gte: start, lte: end },
          conversation: { restaurantId },
        },
      }),

      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: start, lte: end },
        },
      }),

      prisma.campaignPost.findMany({
        where: {
          posted: true,
          postedAt: { gte: start, lte: end },
          campaign: { restaurantId },
        },
        include: {
          campaign: true,
          assignedTeamMember: true,
        },
      }),

      prisma.campaignPost.findMany({
        where: {
          posted: false,
          scheduledAt: { lt: start },
          campaign: { restaurantId },
        },
        include: {
          campaign: true,
          assignedTeamMember: true,
        },
      }),
    ]);

  const revenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    messages,
    orders: orders.length,
    revenue,
    postedCampaignPosts,
    overdueCampaignPosts,
  };
}
