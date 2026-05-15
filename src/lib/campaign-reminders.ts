import { prisma } from "@/lib/prisma";

export async function getCampaignPostReminders(restaurantId: string) {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const posts = await prisma.campaignPost.findMany({
    where: {
      campaign: {
        restaurantId,
      },
      posted: false,
    },
    include: {
      campaign: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  const overdue = posts.filter((post) => post.scheduledAt < startOfToday);

  const dueToday = posts.filter(
    (post) =>
      post.scheduledAt >= startOfToday && post.scheduledAt <= endOfToday
  );

  const upcoming = posts.filter((post) => post.scheduledAt > endOfToday);

  return {
    overdue,
    dueToday,
    upcoming,
    totalPending: posts.length,
  };
}
