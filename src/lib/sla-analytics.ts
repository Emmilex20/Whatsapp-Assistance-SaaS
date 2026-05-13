import { getConversationSlaStatus } from "@/lib/conversation-sla";
import { prisma } from "@/lib/prisma";

export async function getSlaAnalytics({
  restaurantId,
  plan,
}: {
  restaurantId: string;
  plan?: string;
}) {
  const conversations = await prisma.conversation.findMany({
    where: { restaurantId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      assignedTeamMember: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const enriched = conversations.map((conversation) => {
    const sla = getConversationSlaStatus({
      messages: conversation.messages,
      plan,
      priority: conversation.priority,
    });

    return {
      conversation,
      sla,
    };
  });

  const overdue = enriched.filter((item) => item.sla.status === "OVERDUE");
  const waiting = enriched.filter((item) => item.sla.status === "WAITING");
  const replied = enriched.filter((item) => item.sla.status === "REPLIED");

  const handled = replied.length;
  const totalActionable = overdue.length + waiting.length + replied.length;

  const complianceRate = totalActionable
    ? Math.round((handled / totalActionable) * 100)
    : 0;

  const priorityBreakdown = ["LOW", "NORMAL", "HIGH", "URGENT"].map(
    (priority) => ({
      priority,
      count: enriched.filter(
        (item) => item.conversation.priority === priority
      ).length,
      overdue: enriched.filter(
        (item) =>
          item.conversation.priority === priority &&
          item.sla.status === "OVERDUE"
      ).length,
    })
  );

  return {
    total: conversations.length,
    overdue: overdue.length,
    waiting: waiting.length,
    replied: replied.length,
    complianceRate,
    priorityBreakdown,
    overdueConversations: overdue.map((item) => ({
      id: item.conversation.id,
      customerName:
        item.conversation.customerName || item.conversation.customerPhone,
      customerPhone: item.conversation.customerPhone,
      priority: item.conversation.priority,
      assignedTo:
        item.conversation.assignedTeamMember?.name ||
        item.conversation.assignedTeamMember?.email ||
        "Unassigned",
      minutesWaiting: item.sla.minutesWaiting,
      targetMinutes: item.sla.targetMinutes,
    })),
  };
}
