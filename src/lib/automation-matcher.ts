import { prisma } from "@/lib/prisma";

type MatchAutomationParams = {
  restaurantId: string;
  message: string;
};

export async function matchAutomation({
  restaurantId,
  message,
}: MatchAutomationParams) {
  const normalizedMessage = message.toLowerCase();

  const automations = await prisma.automation.findMany({
    where: {
      restaurantId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const matchedAutomation = automations.find((automation) => {
    return automation.triggers.some((trigger) =>
      normalizedMessage.includes(trigger.toLowerCase())
    );
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
