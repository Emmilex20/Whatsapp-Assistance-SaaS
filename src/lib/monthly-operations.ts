import { prisma } from "@/lib/prisma";

function getMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getMonthlyOperationsReport(restaurantId: string) {
  const { start, end } = getMonthRange();

  const [
    messages,
    orders,
    campaignPosts,
    campaigns,
    aiUsageLogs,
    mediaGenerations,
  ] = await Promise.all([
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
        campaign: { restaurantId },
        scheduledAt: { gte: start, lte: end },
      },
      include: {
        campaign: true,
        assignedTeamMember: true,
      },
      orderBy: { scheduledAt: "asc" },
    }),

    prisma.promoCampaign.findMany({
      where: { restaurantId },
      orderBy: { revenueGenerated: "desc" },
      take: 10,
    }),

    prisma.aIUsageLog.findMany({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
      },
    }),

    prisma.mediaGeneration.findMany({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
      },
    }),
  ]);

  const validOrders = orders.filter((order) => order.status !== "CANCELLED");

  const revenue = validOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const postedPosts = campaignPosts.filter((post) => post.posted);
  const missedPosts = campaignPosts.filter(
    (post) => !post.posted && post.scheduledAt < new Date()
  );

  const aiTokens = aiUsageLogs.reduce((sum, log) => sum + log.totalTokens, 0);
  const aiCost = aiUsageLogs.reduce((sum, log) => sum + log.estimatedCost, 0);

  const mediaCost = mediaGenerations.reduce(
    (sum, item) => sum + item.estimatedCost,
    0
  );

  return {
    start,
    end,
    messages,
    orders: orders.length,
    validOrders: validOrders.length,
    revenue,
    campaignPosts,
    postedPosts,
    missedPosts,
    topCampaigns: campaigns,
    ai: {
      events: aiUsageLogs.length,
      tokens: aiTokens,
      cost: aiCost,
    },
    media: {
      generations: mediaGenerations.length,
      cost: mediaCost,
    },
  };
}
