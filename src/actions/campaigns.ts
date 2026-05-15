"use server";

import { revalidatePath } from "next/cache";
import { PromoCampaignStatus } from "@/generated/prisma/client";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { campaignPromptPresets } from "@/lib/campaign-prompt-presets";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

function parseOptionalDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function parseMetric(value: FormDataEntryValue | null) {
  const number = Number(value || 0);

  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export async function createPromoCampaign(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const goal = String(formData.get("goal") || "").trim();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");

  if (!title) {
    return { error: "Campaign title is required." };
  }

  await prisma.promoCampaign.create({
    data: {
      restaurantId: restaurant.id,
      title,
      description: description || null,
      goal: goal || null,
      startDate: parseOptionalDate(startDate),
      endDate: parseOptionalDate(endDate),
    },
  });

  revalidatePath("/dashboard/campaigns");

  return { success: "Campaign created successfully." };
}

export async function createRecommendedPromoCampaigns() {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const existingCampaigns = await prisma.promoCampaign.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    select: {
      title: true,
    },
  });

  const existingTitles = new Set(
    existingCampaigns.map((campaign) => campaign.title.toLowerCase())
  );

  const campaignsToCreate = campaignPromptPresets.filter(
    (campaign) => !existingTitles.has(campaign.title.toLowerCase())
  );

  if (campaignsToCreate.length === 0) {
    return { success: "Recommended campaign prompts are already added." };
  }

  await prisma.promoCampaign.createMany({
    data: campaignsToCreate.map((campaign) => ({
      restaurantId: restaurant.id,
      title: campaign.title,
      goal: campaign.goal,
      description: campaign.description,
      status: "DRAFT",
    })),
  });

  revalidatePath("/dashboard/campaigns");

  return {
    success: `${campaignsToCreate.length} recommended campaign prompt${
      campaignsToCreate.length === 1 ? "" : "s"
    } added.`,
  };
}

export async function updatePromoCampaignStatus(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const status = String(
    formData.get("status") || "DRAFT"
  ) as PromoCampaignStatus;

  const campaign = await prisma.promoCampaign.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!campaign) {
    return { error: "Campaign not found." };
  }

  await prisma.promoCampaign.update({
    where: { id: campaign.id },
    data: { status },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaign.id}`);

  return { success: "Campaign status updated." };
}

export async function attachMediaToCampaign(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const mediaId = String(formData.get("mediaId") || "");
  const campaignId = String(formData.get("campaignId") || "");

  const campaign = await prisma.promoCampaign.findFirst({
    where: {
      id: campaignId,
      restaurantId: restaurant.id,
    },
  });

  if (!campaign) {
    return { error: "Campaign not found." };
  }

  const media = await prisma.mediaGeneration.findFirst({
    where: {
      id: mediaId,
      restaurantId: restaurant.id,
    },
  });

  if (!media) {
    return { error: "Media generation not found." };
  }

  await prisma.mediaGeneration.update({
    where: { id: media.id },
    data: {
      campaignId: campaign.id,
    },
  });

  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaign.id}`);

  return { success: "Media added to campaign." };
}

export async function detachMediaFromCampaign(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const mediaId = String(formData.get("mediaId") || "");
  const campaignId = String(formData.get("campaignId") || "");

  const media = await prisma.mediaGeneration.findFirst({
    where: {
      id: mediaId,
      restaurantId: restaurant.id,
      campaignId,
    },
  });

  if (!media) {
    return { error: "Campaign media not found." };
  }

  await prisma.mediaGeneration.update({
    where: { id: media.id },
    data: {
      campaignId: null,
    },
  });

  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);

  return { success: "Media removed from campaign." };
}

export async function updateCampaignPerformance(formData: FormData) {
  const allowed = await checkPermission("manage_campaigns");

  if (!allowed) {
    return { error: "You do not have permission to manage campaigns." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const campaign = await prisma.promoCampaign.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!campaign) {
    return { error: "Campaign not found." };
  }

  await prisma.promoCampaign.update({
    where: { id: campaign.id },
    data: {
      impressions: parseMetric(formData.get("impressions")),
      whatsappInquiries: parseMetric(formData.get("whatsappInquiries")),
      ordersGenerated: parseMetric(formData.get("ordersGenerated")),
      revenueGenerated: parseMetric(formData.get("revenueGenerated")),
      performanceNotes:
        String(formData.get("performanceNotes") || "").trim() || null,
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaign.id}`);

  return { success: "Campaign performance updated." };
}
