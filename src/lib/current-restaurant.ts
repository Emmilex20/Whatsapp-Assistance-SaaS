import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";

export async function getCurrentRestaurant() {
  const user = await getCurrentDbUser();

  if (!user) return null;

  if (user.activeRestaurantId) {
    const activeRestaurant = await prisma.restaurant.findFirst({
      where: {
        id: user.activeRestaurantId,
        ownerId: user.id,
      },
    });

    if (activeRestaurant) return activeRestaurant;
  }

  const firstRestaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return firstRestaurant;
}

export async function getOrCreateCurrentRestaurant() {
  const user = await getCurrentDbUser();

  if (!user) return null;

  const activeRestaurant = await getCurrentRestaurant();

  if (activeRestaurant) return activeRestaurant;

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: user.id,
      name: "My Restaurant",
      subscription: {
        create: {
          plan: "starter",
          status: "FREE",
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      activeRestaurantId: restaurant.id,
    },
  });

  return restaurant;
}

export async function getUserRestaurants() {
  const user = await getCurrentDbUser();

  if (!user) return [];

  return prisma.restaurant.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });
}
