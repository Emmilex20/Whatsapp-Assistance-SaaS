import { prisma } from "@/lib/prisma";

export async function getResolutionAnalytics(restaurantId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { restaurantId },
    include: {
      assignedTeamMember: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const open = conversations.filter(
    (conversation) => conversation.workflowStatus === "OPEN"
  );

  const pending = conversations.filter(
    (conversation) => conversation.workflowStatus === "PENDING"
  );

  const resolved = conversations.filter(
    (conversation) => conversation.workflowStatus === "RESOLVED"
  );

  const resolvedWithTime = resolved.filter(
    (conversation) => conversation.resolvedAt
  );

  const averageResolutionMinutes = resolvedWithTime.length
    ? Math.round(
        resolvedWithTime.reduce((sum, conversation) => {
          const resolvedAt = conversation.resolvedAt!;
          const createdAt = conversation.createdAt;

          return (
            sum +
            Math.floor((resolvedAt.getTime() - createdAt.getTime()) / 60000)
          );
        }, 0) / resolvedWithTime.length
      )
    : 0;

  const total = conversations.length;
  const resolutionRate = total ? Math.round((resolved.length / total) * 100) : 0;

  const agentMap = new Map<
    string,
    {
      name: string;
      resolved: number;
      open: number;
      pending: number;
    }
  >();

  conversations.forEach((conversation) => {
    const agentId = conversation.assignedTeamMemberId || "unassigned";
    const agentName =
      conversation.assignedTeamMember?.name ||
      conversation.assignedTeamMember?.email ||
      "Unassigned";

    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        name: agentName,
        resolved: 0,
        open: 0,
        pending: 0,
      });
    }

    const entry = agentMap.get(agentId)!;

    if (conversation.workflowStatus === "RESOLVED") entry.resolved += 1;
    if (conversation.workflowStatus === "OPEN") entry.open += 1;
    if (conversation.workflowStatus === "PENDING") entry.pending += 1;
  });

  return {
    total,
    open: open.length,
    pending: pending.length,
    resolved: resolved.length,
    resolutionRate,
    averageResolutionMinutes,
    agentBreakdown: Array.from(agentMap.values()),
    recentResolved: resolved
      .filter((conversation) => conversation.resolvedAt)
      .sort((a, b) => b.resolvedAt!.getTime() - a.resolvedAt!.getTime())
      .slice(0, 8),
  };
}
