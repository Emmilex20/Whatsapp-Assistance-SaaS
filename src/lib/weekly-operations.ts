import { prisma } from "@/lib/prisma";

function getWeekRange() {
  const now = new Date();

  const start = new Date(now);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);

  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getWeeklyOperationsReport(restaurantId: string) {
  const { start, end } = getWeekRange();

  const [messages, orders, campaignPosts, campaigns] = await Promise.all([
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
      take: 5,
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

  return {
    start,
    end,
    messages,
    orders: orders.length,
    revenue,
    postedPosts,
    missedPosts,
    campaignPosts,
    topCampaigns: campaigns,
  };
}
