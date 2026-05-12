import { prisma } from "@/lib/prisma";

export async function getRestaurantCustomers(restaurantId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { restaurantId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return conversations.map((conversation) => {
    const totalSpent = conversation.orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      id: conversation.id,
      name: conversation.customerName || "Unknown customer",
      phone: conversation.customerPhone,
      status: conversation.status,
      lastMessage: conversation.messages[0]?.content || "No recent message",
      lastActive: conversation.updatedAt,
      orderCount: conversation.orders.length,
      totalSpent,
    };
  });
}

export async function getCustomerProfile({
  restaurantId,
  conversationId,
}: {
  restaurantId: string;
  conversationId: string;
}) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      restaurantId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
    },
  });
}
