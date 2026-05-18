import { prisma } from "@/lib/prisma";

type DeliveryZoneMatch = {
  area: string;
  fee: number;
};

const zoneQualifierWords = new Set([
  "area",
  "areas",
  "around",
  "delivery",
  "environs",
  "inside",
  "lagos",
  "location",
  "outside",
  "within",
  "zone",
]);

function normalizeLocationText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulZoneTokens(area: string) {
  return normalizeLocationText(area)
    .split(" ")
    .filter((token) => token.length > 2 && !zoneQualifierWords.has(token));
}

function scoreDeliveryZoneMatch({
  address,
  zone,
}: {
  address: string;
  zone: DeliveryZoneMatch;
}) {
  const normalizedAddress = normalizeLocationText(address);
  const normalizedArea = normalizeLocationText(zone.area);

  if (!normalizedAddress || !normalizedArea) return 0;

  let score = 0;

  if (normalizedAddress.includes(normalizedArea)) {
    score += 100;
  }

  const areaTokens = getMeaningfulZoneTokens(zone.area);
  const matchedTokens = areaTokens.filter((token) =>
    normalizedAddress.includes(token)
  );

  score += matchedTokens.length * 20;

  const addressSaysOutside = /\b(outside|outskirt|outskirts)\b/.test(
    normalizedAddress
  );
  const addressSaysWithin = /\b(within|inside|in)\b/.test(normalizedAddress);
  const zoneSaysOutside = /\boutside\b/.test(normalizedArea);
  const zoneSaysWithin = /\b(within|inside)\b/.test(normalizedArea);

  if (addressSaysOutside && zoneSaysOutside) score += 12;
  if (addressSaysWithin && zoneSaysWithin) score += 12;

  if (matchedTokens.length > 0 && zoneSaysWithin && !addressSaysOutside) {
    score += 4;
  }

  if (matchedTokens.length > 0 && zoneSaysOutside && !addressSaysOutside) {
    score -= 5;
  }

  if (addressSaysOutside && zoneSaysWithin) {
    score -= 8;
  }

  return score;
}

export function findBestDeliveryZoneMatch<T extends DeliveryZoneMatch>({
  address,
  zones,
}: {
  address: string;
  zones: T[];
}) {
  const rankedZones = zones
    .map((zone) => ({
      zone,
      score: scoreDeliveryZoneMatch({
        address,
        zone,
      }),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return rankedZones[0]?.zone || null;
}

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

  return findBestDeliveryZoneMatch({
    address,
    zones,
  });
}
