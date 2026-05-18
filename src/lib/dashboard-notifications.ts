import { prisma } from "@/lib/prisma";

export type DashboardNotificationCounts = Record<string, number>;

export async function getDashboardNotificationCounts(
  restaurantId?: string | null
): Promise<DashboardNotificationCounts> {
  if (!restaurantId) return {};

  const now = new Date();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    inbox,
    orders,
    complaints,
    tasks,
    campaigns,
    customerMemory,
    media,
  ] = await Promise.all([
    prisma.conversation.count({
      where: {
        restaurantId,
        workflowStatus: {
          not: "RESOLVED",
        },
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: "NEW",
      },
    }),
    prisma.complaintAlert.count({
      where: {
        restaurantId,
        resolved: false,
      },
    }),
    prisma.campaignPost.count({
      where: {
        posted: false,
        scheduledAt: {
          lte: endOfToday,
        },
        assignedTeamMemberId: {
          not: null,
        },
        campaign: {
          restaurantId,
        },
      },
    }),
    prisma.campaignPost.count({
      where: {
        posted: false,
        scheduledAt: {
          lt: now,
        },
        campaign: {
          restaurantId,
        },
      },
    }),
    prisma.customerMemory.count({
      where: {
        restaurantId,
        active: true,
        reviewStatus: "PENDING",
      },
    }),
    prisma.mediaGeneration.count({
      where: {
        restaurantId,
        status: "FAILED",
      },
    }),
  ]);

  return {
    "/dashboard/inbox": inbox,
    "/dashboard/orders": orders,
    "/dashboard/complaints": complaints,
    "/dashboard/tasks": tasks,
    "/dashboard/campaigns": campaigns,
    "/dashboard/customer-memory": customerMemory,
    "/dashboard/media": media,
  };
}

export function getDashboardNotificationTotal(
  counts: DashboardNotificationCounts
) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
