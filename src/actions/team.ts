"use server";

import { revalidatePath } from "next/cache";
import type { TeamRole } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { getRestaurantUsage, isAtLimit } from "@/lib/usage";

const validTeamRoles: TeamRole[] = ["OWNER", "MANAGER", "AGENT"];

function parseTeamRole(value: FormDataEntryValue | null): TeamRole {
  const role = String(value || "AGENT").toUpperCase() as TeamRole;

  return validTeamRoles.includes(role) ? role : "AGENT";
}

export async function inviteTeamMember(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const usage = await getRestaurantUsage(restaurant.id);

  if (isAtLimit(usage.usage.agents, usage.limits.agents)) {
    return {
      error: "Team member limit reached. Upgrade your plan to add more agents.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = parseTeamRole(formData.get("role"));

  if (!email) {
    return { error: "Email is required." };
  }

  await prisma.teamMember.upsert({
    where: {
      restaurantId_email: {
        restaurantId: restaurant.id,
        email,
      },
    },
    update: {
      name,
      role,
      invited: true,
    },
    create: {
      restaurantId: restaurant.id,
      name,
      email,
      role,
      invited: true,
      accepted: false,
    },
  });

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/billing");

  return { success: "Team member invited successfully." };
}

export async function updateTeamMemberRole(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const role = parseTeamRole(formData.get("role"));

  await prisma.teamMember.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: { role },
  });

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/billing");
}

export async function removeTeamMember(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");

  await prisma.teamMember.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/billing");
}
