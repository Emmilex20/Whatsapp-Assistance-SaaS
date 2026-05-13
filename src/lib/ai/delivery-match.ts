import { prisma } from "@/lib/prisma";

export async function findPossibleDeliveryZoneMatches({
  restaurantId,
  message,
}: {
  restaurantId: string;
  message: string;
}) {
  const zones = await prisma.deliveryZone.findMany({
    where: {
      restaurantId,
      active: true,
    },
  });

  const normalized = message.toLowerCase();

  return zones.filter((zone) => normalized.includes(zone.area.toLowerCase()));
}
