import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function getCurrentTeamMember() {
  const user = await getCurrentDbUser();

  if (!user?.email) {
    return null;
  }

  const ownedRestaurant = user.activeRestaurantId
    ? await prisma.restaurant.findFirst({
        where: {
          id: user.activeRestaurantId,
          ownerId: user.id,
        },
      })
    : await prisma.restaurant.findFirst({
        where: { ownerId: user.id },
        orderBy: { createdAt: "asc" },
      });

  if (ownedRestaurant) {
    return {
      id: user.id,
      restaurantId: ownedRestaurant.id,
      email: user.email,
      name: user.name,
      role: "OWNER",
    };
  }

  return prisma.teamMember.findFirst({
    where: {
      email: user.email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
