import { prisma } from "@/lib/prisma";

export async function findPossibleMenuMatches({
  restaurantId,
  message,
}: {
  restaurantId: string;
  message: string;
}) {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      available: true,
    },
  });

  const normalized = message.toLowerCase();

  return menuItems.filter((item) =>
    normalized.includes(item.name.toLowerCase())
  );
}
