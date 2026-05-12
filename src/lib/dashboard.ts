import { prisma } from "@/lib/prisma";

export async function getDashboardOverview(restaurantId: string) {
  const [restaurant, conversations, automations, menuItems, faqs, orders] =
    await Promise.all([
      prisma.restaurant.findUnique({
        where: { id: restaurantId },
      }),

      prisma.conversation.findMany({
        where: { restaurantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),

      prisma.automation.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      prisma.menuItem.count({
        where: { restaurantId },
      }),

      prisma.fAQ.count({
        where: { restaurantId },
      }),

      prisma.order.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: true,
        },
      }),
    ]);

  const totalMessages = await prisma.message.count({
    where: {
      conversation: {
        restaurantId,
      },
    },
  });

  const botReplies = await prisma.message.count({
    where: {
      senderType: "BOT",
      conversation: {
        restaurantId,
      },
    },
  });

  const newOrders = await prisma.order.count({
    where: {
      restaurantId,
      status: "NEW",
    },
  });

  const activeOrders = await prisma.order.count({
    where: {
      restaurantId,
      status: {
        in: ["NEW", "CONFIRMED", "PREPARING", "READY"],
      },
    },
  });

  const activeAutomations = automations.filter(
    (automation) => automation.status === "ACTIVE"
  );

  const setupItems = [
    Boolean(restaurant?.name && restaurant.name !== "My Restaurant"),
    Boolean(restaurant?.whatsappNumber),
    Boolean(restaurant?.whatsappPhoneNumberId),
    menuItems > 0,
    faqs > 0,
    automations.length > 0,
  ];

  const completedSetup = setupItems.filter(Boolean).length;
  const setupProgress = Math.round((completedSetup / setupItems.length) * 100);

  return {
    restaurant,
    conversations,
    automations,
    orders,
    stats: {
      totalMessages,
      conversations: conversations.length,
      botReplies,
      activeAutomations: activeAutomations.length,
      menuItems,
      faqs,
      setupProgress,
      newOrders,
      activeOrders,
    },
  };
}
