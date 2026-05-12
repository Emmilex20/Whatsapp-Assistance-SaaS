import { prisma } from "@/lib/prisma";

export function isDeliveryRequest(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("delivery") ||
    normalized.includes("deliver") ||
    normalized.includes("location") ||
    normalized.includes("fee") ||
    normalized.includes("how much to") ||
    normalized.includes("send to")
  );
}

export async function buildDeliveryReply({
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
    orderBy: {
      area: "asc",
    },
  });

  if (!zones.length) {
    return "Yes, we offer delivery. Please send your location and a staff member will confirm the delivery fee.";
  }

  const normalized = message.toLowerCase();
  const matchedZone = zones.find((zone) =>
    normalized.includes(zone.area.toLowerCase())
  );

  if (matchedZone) {
    return `Yes, we deliver to ${matchedZone.area}.

Delivery fee: ₦${matchedZone.fee.toLocaleString()}
Estimated time: ${matchedZone.estimatedTime || "Confirmed after order"}

Reply with "I want [food name]" to start your order.`;
  }

  const zoneList = zones
    .map(
      (zone) =>
        `• ${zone.area} - ₦${zone.fee.toLocaleString()}${
          zone.estimatedTime ? ` (${zone.estimatedTime})` : ""
        }`
    )
    .join("\n");

  return `Yes, we currently deliver to:

${zoneList}

Please send your exact location if your area is not listed.`;
}
