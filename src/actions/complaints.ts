"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

export async function resolveComplaintAlert(formData: FormData) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    return { error: "You do not have permission to manage complaints." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const alert = await prisma.complaintAlert.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!alert) {
    return { error: "Complaint alert not found." };
  }

  await prisma.complaintAlert.update({
    where: {
      id: alert.id,
    },
    data: {
      resolved: true,
    },
  });

  revalidatePath("/dashboard/complaints");
  revalidatePath("/dashboard/inbox");

  return { success: "Complaint alert resolved." };
}
