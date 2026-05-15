"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

function parseScheduledAt(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

async function getAssignableTeamMemberId({
  restaurantId,
  assignedTeamMemberId,
}: {
  restaurantId: string;
  assignedTeamMemberId: string;
}) {
  if (!assignedTeamMemberId) {
    return null;
  }

  const teamMember = await prisma.teamMember.findFirst({
    where: {
      id: assignedTeamMemberId,
      restaurantId,
    },
    select: {
      id: true,
    },
  });

  return teamMember?.id || null;
}

export async function createCampaignPost(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const campaignId = String(formData.get("campaignId") || "");
  const title = String(formData.get("title") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const scheduledAtValue = String(formData.get("scheduledAt") || "");
  const assignedTeamMemberId = String(
    formData.get("assignedTeamMemberId") || ""
  );
  const notes = String(formData.get("notes") || "").trim();

  if (!campaignId) {
    return { error: "Campaign is required." };
  }

  if (!title) {
    return { error: "Post title is required." };
  }

  if (!platform) {
    return { error: "Platform is required." };
  }

  if (!scheduledAtValue) {
    return { error: "Schedule date is required." };
  }

  const scheduledAt = parseScheduledAt(scheduledAtValue);

  if (!scheduledAt) {
    return { error: "Schedule date is invalid." };
  }

  const campaign = await prisma.promoCampaign.findFirst({
    where: {
      id: campaignId,
      restaurantId: restaurant.id,
    },
  });

  if (!campaign) {
    return { error: "Campaign not found." };
  }

  const assignableTeamMemberId = await getAssignableTeamMemberId({
    restaurantId: restaurant.id,
    assignedTeamMemberId,
  });

  await prisma.campaignPost.create({
    data: {
      campaignId: campaign.id,
      assignedTeamMemberId: assignableTeamMemberId,
      title,
      platform,
      scheduledAt,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath(`/dashboard/campaigns/${campaign.id}`);

  return { success: "Campaign post scheduled." };
}

export async function toggleCampaignPostPosted(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const completionNotes = String(
    formData.get("completionNotes") || ""
  ).trim();

  const post = await prisma.campaignPost.findFirst({
    where: {
      id,
      campaign: {
        restaurantId: restaurant.id,
      },
    },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  await prisma.campaignPost.update({
    where: { id: post.id },
    data: {
      posted: !post.posted,
      postedAt: post.posted ? null : new Date(),
      completionNotes: post.posted ? null : completionNotes || null,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath(`/dashboard/campaigns/${post.campaignId}`);

  return {
    success: post.posted
      ? "Post marked as not posted."
      : "Post marked as posted.",
  };
}

export async function updateCampaignPost(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const scheduledAtValue = String(formData.get("scheduledAt") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!title) {
    return { error: "Post title is required." };
  }

  if (!platform) {
    return { error: "Platform is required." };
  }

  if (!scheduledAtValue) {
    return { error: "Schedule date is required." };
  }

  const scheduledAt = parseScheduledAt(scheduledAtValue);

  if (!scheduledAt) {
    return { error: "Schedule date is invalid." };
  }

  const post = await prisma.campaignPost.findFirst({
    where: {
      id,
      campaign: {
        restaurantId: restaurant.id,
      },
    },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  await prisma.campaignPost.update({
    where: { id: post.id },
    data: {
      title,
      platform,
      scheduledAt,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath(`/dashboard/campaigns/${post.campaignId}`);

  return { success: "Scheduled post updated." };
}

export async function deleteCampaignPost(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const post = await prisma.campaignPost.findFirst({
    where: {
      id,
      campaign: {
        restaurantId: restaurant.id,
      },
    },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  await prisma.campaignPost.delete({
    where: { id: post.id },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath(`/dashboard/campaigns/${post.campaignId}`);

  return { success: "Scheduled post deleted." };
}

export async function assignCampaignPost(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const assignedTeamMemberId = String(
    formData.get("assignedTeamMemberId") || ""
  );

  const post = await prisma.campaignPost.findFirst({
    where: {
      id,
      campaign: {
        restaurantId: restaurant.id,
      },
    },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  const assignableTeamMemberId = await getAssignableTeamMemberId({
    restaurantId: restaurant.id,
    assignedTeamMemberId,
  });

  await prisma.campaignPost.update({
    where: { id: post.id },
    data: {
      assignedTeamMemberId: assignableTeamMemberId,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/campaigns/calendar");
  revalidatePath(`/dashboard/campaigns/${post.campaignId}`);
  revalidatePath("/dashboard/team");

  return { success: "Campaign post assignment updated." };
}
