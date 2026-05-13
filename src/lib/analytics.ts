import { prisma } from "@/lib/prisma";

const IGNORED_KEYWORDS = new Set([
  "about",
  "after",
  "also",
  "from",
  "have",
  "hello",
  "please",
  "send",
  "that",
  "this",
  "want",
  "what",
  "when",
  "with",
  "your",
]);

export async function getRestaurantAnalytics(restaurantId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { restaurantId },
    include: {
      messages: true,
    },
  });

  const automations = await prisma.automation.findMany({
    where: { restaurantId },
    orderBy: { usedCount: "desc" },
  });

  const allMessages = conversations.flatMap((conversation) =>
    conversation.messages.map((message) => ({
      ...message,
      customerPhone: conversation.customerPhone,
    }))
  );

  const customerMessages = allMessages.filter(
    (message) => message.senderType === "CUSTOMER"
  );

  const botMessages = allMessages.filter(
    (message) => message.senderType === "BOT"
  );

  const humanMessages = allMessages.filter(
    (message) => message.senderType === "HUMAN"
  );

  const resolvedConversations = conversations.filter(
    (conversation) => conversation.workflowStatus === "RESOLVED"
  ).length;

  const hourMap = new Map<number, number>();

  customerMessages.forEach((message) => {
    const hour = message.createdAt.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  const busiestHours = Array.from(hourMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hour, messages]) => ({
      time: `${hour}:00`,
      messages,
    }));

  const keywordMap = new Map<string, number>();

  customerMessages.forEach((message) => {
    const words = message.content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 3 && !IGNORED_KEYWORDS.has(word));

    words.forEach((word) => {
      keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
    });
  });

  const popularKeywords = Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, count]) => ({
      keyword,
      count,
    }));

  return {
    totalConversations: conversations.length,
    totalCustomerMessages: customerMessages.length,
    totalBotReplies: botMessages.length,
    totalHumanReplies: humanMessages.length,
    resolvedConversations,
    totalAutomationUsage: automations.reduce(
      (sum, automation) => sum + automation.usedCount,
      0
    ),
    automations,
    busiestHours,
    popularKeywords,
  };
}
