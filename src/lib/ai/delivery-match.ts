import { prisma } from "@/lib/prisma";
import { findBestDeliveryZoneMatch } from "@/lib/delivery-fee";

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

  const bestMatch = findBestDeliveryZoneMatch({
    address: message,
    zones,
  });

  return bestMatch ? [bestMatch] : [];
}
