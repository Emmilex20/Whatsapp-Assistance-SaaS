import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";

export async function getCurrentRestaurant() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId: user.id,
    },
  });

  return restaurant;
}

export async function getOrCreateCurrentRestaurant() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const existingRestaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId: user.id,
    },
  });

  if (existingRestaurant) {
    return existingRestaurant;
  }

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

  return restaurant;
}