import { prisma } from "@/lib/prisma";
import { findBestIntentMatch } from "@/lib/customer-intent";

type MatchAutomationParams = {
  restaurantId: string;
  message: string;
};

export async function matchAutomation({
  restaurantId,
  message,
}: MatchAutomationParams) {
  const automations = await prisma.automation.findMany({
    where: {
      restaurantId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const matchedAutomation = findBestIntentMatch({
    message,
    items: automations,
    getPhrases: (automation) => [
      automation.name,
      ...automation.triggers,
      automation.response,
    ],
    minimumScore: 0.52,
  });

  if (!matchedAutomation) {
    return null;
  }

  await prisma.automation.update({
    where: {
      id: matchedAutomation.id,
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });

  return matchedAutomation;
}
