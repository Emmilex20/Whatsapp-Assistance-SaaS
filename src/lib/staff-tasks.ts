import { prisma } from "@/lib/prisma";

export async function getStaffTasks(restaurantId: string) {
  const teamMembers = await prisma.teamMember.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedConversations: {
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      assignedOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      assignedCampaignPosts: {
        orderBy: { scheduledAt: "asc" },
        include: {
          campaign: true,
        },
      },
    },
  });

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return teamMembers.map((member) => {
    const pendingPosts = member.assignedCampaignPosts.filter(
      (post) => !post.posted
    );

    const overduePosts = pendingPosts.filter(
      (post) => post.scheduledAt < today
    );

    const dueTodayPosts = pendingPosts.filter(
      (post) => post.scheduledAt.toDateString() === now.toDateString()
    );

    const completedPostsToday = member.assignedCampaignPosts.filter((post) => {
      if (!post.postedAt) return false;

      return post.postedAt.toDateString() === now.toDateString();
    });

    return {
      id: member.id,
      name: member.name || member.email,
      email: member.email,
      role: member.role,
      conversations: member.assignedConversations,
      orders: member.assignedOrders,
      campaignPosts: pendingPosts,
      overduePosts,
      dueTodayPosts,
      completedPostsToday,
      totals: {
        conversations: member.assignedConversations.length,
        orders: member.assignedOrders.length,
        campaignPosts: pendingPosts.length,
        overduePosts: overduePosts.length,
        dueTodayPosts: dueTodayPosts.length,
        completedPostsToday: completedPostsToday.length,
      },
    };
  });
}
