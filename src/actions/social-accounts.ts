"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { isSocialAutoPostingSupported } from "@/lib/social-platforms";

function revalidateSocialPages() {
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath("/dashboard/campaigns");
}

export async function createSocialAccount(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const provider = String(formData.get("provider") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const accountHandle = String(formData.get("accountHandle") || "").trim();
  const connectionNote = String(formData.get("connectionNote") || "").trim();
  const postingEnabled = formData.get("postingEnabled") === "on";

  if (!provider) {
    return { error: "Platform is required." };
  }

  if (!displayName) {
    return { error: "Account display name is required." };
  }

  await prisma.socialAccount.create({
    data: {
      restaurantId: restaurant.id,
      provider,
      displayName,
      accountHandle: accountHandle || null,
      connectionNote: connectionNote || null,
      permissions: postingEnabled ? ["publish"] : [],
      postingEnabled:
        postingEnabled && isSocialAutoPostingSupported(provider),
      status: postingEnabled ? "CONNECTED" : "CONNECTED_MANUAL",
      lastConnectedAt: new Date(),
    },
  });

  revalidateSocialPages();

  return { success: "Social account permission saved." };
}

export async function toggleSocialAccountPosting(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const account = await prisma.socialAccount.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!account) {
    return { error: "Social account not found." };
  }

  if (!isSocialAutoPostingSupported(account.provider)) {
    return { error: "This platform is manual-only in the current API flow." };
  }

  await prisma.socialAccount.update({
    where: {
      id: account.id,
    },
    data: {
      paused: !account.paused,
    },
  });

  revalidateSocialPages();

  return {
    success: account.paused
      ? "Social auto-posting resumed."
      : "Social auto-posting paused.",
  };
}
