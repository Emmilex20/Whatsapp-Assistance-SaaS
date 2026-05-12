import { prisma } from "@/lib/prisma";

export async function findMatchingDeliveryZone({
  restaurantId,
  address,
}: {
  restaurantId: string;
  address: string;
}) {
  const zones = await prisma.deliveryZone.findMany({
    where: {
      restaurantId,
      active: true,
    },
  });

  const normalizedAddress = address.toLowerCase();

  return (
    zones.find((zone) => normalizedAddress.includes(zone.area.toLowerCase())) ||
    null
  );
}
