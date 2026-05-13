"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";

function revalidateRestaurantScope() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/restaurants");
  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/settings/delivery");
  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard/pilots");
}

export async function createRestaurant(formData: FormData) {
  const user = await getCurrentDbUser();

  if (!user) throw new Error("User not found.");

  const name = String(formData.get("name") || "").trim();

  if (!name) throw new Error("Restaurant name is required.");

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: user.id,
      name,
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

  revalidateRestaurantScope();
}

export async function switchActiveRestaurant(formData: FormData) {
  const user = await getCurrentDbUser();

  if (!user) throw new Error("User not found.");

  const restaurantId = String(formData.get("restaurantId") || "");

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      ownerId: user.id,
    },
  });

  if (!restaurant) throw new Error("Restaurant not found.");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      activeRestaurantId: restaurant.id,
    },
  });

  revalidateRestaurantScope();
}
