import { prisma } from "@/lib/prisma";

export async function getTeamAnalytics(restaurantId: string) {
  const teamMembers = await prisma.teamMember.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedConversations: {
        include: {
          messages: true,
        },
      },
      assignedOrders: true,
    },
  });

  return teamMembers.map((member) => {
    const humanReplies = member.assignedConversations.reduce(
      (sum, conversation) =>
        sum +
        conversation.messages.filter(
          (message) => message.senderType === "HUMAN"
        ).length,
      0
    );

    const deliveredOrders = member.assignedOrders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const activeOrders = member.assignedOrders.filter((order) =>
      ["NEW", "CONFIRMED", "PREPARING", "READY"].includes(order.status)
    ).length;

    const orderValue = member.assignedOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      id: member.id,
      name: member.name || member.email,
      email: member.email,
      role: member.role,
      assignedChats: member.assignedConversations.length,
      assignedOrders: member.assignedOrders.length,
      activeOrders,
      deliveredOrders,
      humanReplies,
      orderValue,
    };
  });
}
