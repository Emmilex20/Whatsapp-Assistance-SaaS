"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getRestaurantUsage, isAtLimit } from "@/lib/usage";

export async function updateRestaurantProfile(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return { error: "Restaurant name is required." };
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name,
      whatsappNumber: String(formData.get("whatsappNumber") || ""),
      whatsappPhoneNumberId: String(formData.get("whatsappPhoneNumberId") || ""),
      address: String(formData.get("address") || ""),
      openingTime: String(formData.get("openingTime") || ""),
      closingTime: String(formData.get("closingTime") || ""),
    },
  });

  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/onboarding");
  revalidatePath("/dashboard");

  return { success: "Restaurant profile updated successfully." };
}

export async function createMenuItem(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const usage = await getRestaurantUsage(restaurant.id);

  if (isAtLimit(usage.usage.menuItems, usage.limits.menuItems)) {
    return {
      error: "Menu item limit reached. Upgrade your plan to add more items.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const price = Number(formData.get("price"));

  if (!name) {
    return { error: "Food name is required." };
  }

  if (!price || Number.isNaN(price)) {
    return { error: "Valid price is required." };
  }

  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      name,
      category,
      price,
      available: true,
    },
  });

  revalidatePath("/dashboard/menu");

  return {
    success: "Menu item added successfully.",
  };
}

export async function updateMenuItem(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");
  const price = Number(formData.get("price"));

  if (!restaurant || !id) {
    throw new Error("Menu item not found.");
  }

  await prisma.menuItem.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      name: String(formData.get("name") || ""),
      category: String(formData.get("category") || ""),
      price: Number.isNaN(price) ? 0 : price,
    },
  });

  revalidatePath("/dashboard/menu");
  redirect("/dashboard/menu");
}

export async function deleteMenuItem(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");

  if (!restaurant || !id) {
    throw new Error("Menu item not found.");
  }

  await prisma.menuItem.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard");
}

export async function createFAQ(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();

  if (!question) {
    return { error: "Question is required." };
  }

  if (!answer) {
    return { error: "Answer is required." };
  }

  await prisma.fAQ.create({
    data: {
      restaurantId: restaurant.id,
      question,
      answer,
    },
  });

  revalidatePath("/dashboard/automations/faqs");

  return { success: "FAQ added successfully." };
}

export async function updateFAQ(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");

  if (!restaurant || !id) {
    throw new Error("FAQ not found.");
  }

  await prisma.fAQ.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      question: String(formData.get("question") || ""),
      answer: String(formData.get("answer") || ""),
    },
  });

  revalidatePath("/dashboard/automations/faqs");
  redirect("/dashboard/automations/faqs");
}

export async function deleteFAQ(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");

  if (!restaurant || !id) {
    throw new Error("FAQ not found.");
  }

  await prisma.fAQ.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/automations/faqs");
  revalidatePath("/dashboard");
}

export async function createAutomation(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const usage = await getRestaurantUsage(restaurant.id);

  if (isAtLimit(usage.usage.automations, usage.limits.automations)) {
    return {
      error: "Automation limit reached. Upgrade your plan to add more rules.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const triggerInput = String(formData.get("triggers") || "").trim();
  const response = String(formData.get("response") || "").trim();

  const triggers = triggerInput
    .split(",")
    .map((trigger) => trigger.trim().toLowerCase())
    .filter(Boolean);

  if (!name) {
    return { error: "Automation name is required." };
  }

  if (!triggers.length) {
    return { error: "Trigger keywords are required." };
  }

  if (!response) {
    return { error: "Assistant reply is required." };
  }

  await prisma.automation.create({
    data: {
      restaurantId: restaurant.id,
      name,
      triggers,
      response,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard/automations/new");

  return {
    success: "Automation created successfully.",
  };
}

export async function updateAutomation(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");
  const triggerInput = String(formData.get("triggers") || "");

  if (!restaurant || !id) {
    throw new Error("Automation not found.");
  }

  const triggers = triggerInput
    .split(",")
    .map((trigger) => trigger.trim().toLowerCase())
    .filter(Boolean);

  await prisma.automation.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      name: String(formData.get("name") || ""),
      triggers,
      response: String(formData.get("response") || ""),
    },
  });

  revalidatePath("/dashboard/automations");
  redirect("/dashboard/automations");
}

export async function deleteAutomation(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");

  if (!restaurant || !id) {
    throw new Error("Automation not found.");
  }

  await prisma.automation.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
}

export async function toggleAutomationStatus(formData: FormData) {
  const restaurant = await getOrCreateCurrentRestaurant();
  const id = String(formData.get("id") || "");
  const currentStatus = String(formData.get("status") || "");

  if (!restaurant || !id) {
    throw new Error("Automation not found.");
  }

  await prisma.automation.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      status: currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE",
    },
  });

  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard");
}
