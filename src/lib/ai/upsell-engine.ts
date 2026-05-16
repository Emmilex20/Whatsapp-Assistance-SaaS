import { isOrderIntent } from "@/lib/order-intent";
import { prisma } from "@/lib/prisma";

type BuildUpsellSuggestionParams = {
  restaurantId: string;
  conversationId: string;
  customerPhone: string;
  latestCustomerMessage: string;
  activeOrderItemNames?: string[];
};

type TrackAcceptedUpsellsParams = {
  restaurantId: string;
  conversationId?: string | null;
  customerPhone: string;
  orderItems: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

const UPSELL_REPEAT_HOURS = 6;
const MAX_CUSTOMER_UPSELLS_PER_DAY = 2;

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasMeaningfulMatch(source: string, target: string) {
  const normalizedSource = normalize(source);
  const normalizedTarget = normalize(target);

  if (!normalizedSource || !normalizedTarget) return false;
  if (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource)
  ) {
    return true;
  }

  const targetTokens = normalizedTarget
    .split(" ")
    .filter((token) => token.length > 2);

  if (targetTokens.length === 0) return false;

  return targetTokens.some((token) => normalizedSource.includes(token));
}

function formatUpsellMessage(message: string) {
  const trimmed = message.trim();

  if (!trimmed) return "";

  return trimmed.length > 140 ? `${trimmed.slice(0, 137).trim()}...` : trimmed;
}

export async function buildUpsellSuggestion({
  restaurantId,
  conversationId,
  customerPhone,
  latestCustomerMessage,
  activeOrderItemNames = [],
}: BuildUpsellSuggestionParams) {
  if (process.env.AI_UPSELLS_ENABLED !== "true") return null;

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      aiUpsellsEnabled: true,
    },
  });

  if (!restaurant?.aiUpsellsEnabled) return null;

  const rules = await prisma.upsellRule.findMany({
    where: {
      restaurantId,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!rules.length) return null;

  const menuMatches = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      available: true,
    },
  });
  const matchedMenuNames = menuMatches
    .filter((item) => hasMeaningfulMatch(latestCustomerMessage, item.name))
    .map((item) => item.name);
  const comparisonText = [
    latestCustomerMessage,
    ...activeOrderItemNames,
    ...matchedMenuNames,
  ].join(" ");

  if (!isOrderIntent(latestCustomerMessage) && !matchedMenuNames.length) {
    return null;
  }

  const matchingRule = rules.find((rule) =>
    hasMeaningfulMatch(comparisonText, rule.triggerItem)
  );

  if (!matchingRule) return null;

  const repeatWindow = new Date();
  repeatWindow.setHours(repeatWindow.getHours() - UPSELL_REPEAT_HOURS);

  const recentSameConversationAttempt = await prisma.upsellAttempt.findFirst({
    where: {
      restaurantId,
      conversationId,
      upsellRuleId: matchingRule.id,
      createdAt: {
        gte: repeatWindow,
      },
    },
  });

  if (recentSameConversationAttempt) return null;

  const dayWindow = new Date();
  dayWindow.setDate(dayWindow.getDate() - 1);

  const customerAttemptCount = await prisma.upsellAttempt.count({
    where: {
      restaurantId,
      customerPhone,
      createdAt: {
        gte: dayWindow,
      },
    },
  });

  if (customerAttemptCount >= MAX_CUSTOMER_UPSELLS_PER_DAY) return null;

  await prisma.$transaction([
    prisma.upsellAttempt.create({
      data: {
        restaurantId,
        upsellRuleId: matchingRule.id,
        conversationId,
        customerPhone,
        triggerItem: matchingRule.triggerItem,
        suggestedItem: matchingRule.suggestedItem,
      },
    }),
    prisma.upsellRule.update({
      where: {
        id: matchingRule.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    }),
  ]);

  return {
    ruleId: matchingRule.id,
    suggestedItem: matchingRule.suggestedItem,
    message: formatUpsellMessage(matchingRule.message),
  };
}

export async function trackAcceptedUpsells({
  restaurantId,
  conversationId,
  customerPhone,
  orderItems,
}: TrackAcceptedUpsellsParams) {
  if (!orderItems.length) return;

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const attempts = await prisma.upsellAttempt.findMany({
    where: {
      restaurantId,
      customerPhone,
      accepted: false,
      createdAt: {
        gte: since,
      },
      ...(conversationId ? { conversationId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  if (!attempts.length) return;

  for (const attempt of attempts) {
    const matchingItems = orderItems.filter((item) =>
      hasMeaningfulMatch(item.name, attempt.suggestedItem)
    );

    if (!matchingItems.length) continue;

    const revenueGenerated = matchingItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await prisma.$transaction([
      prisma.upsellAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          accepted: true,
          acceptedAt: new Date(),
          revenueGenerated,
        },
      }),
      prisma.upsellRule.update({
        where: {
          id: attempt.upsellRuleId,
        },
        data: {
          acceptedUpsells: {
            increment: 1,
          },
          revenueGenerated: {
            increment: revenueGenerated,
          },
        },
      }),
    ]);
  }
}
