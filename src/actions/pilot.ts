"use server";

import { revalidatePath } from "next/cache";
import type { PilotStatus, PilotTestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getPilotGoLiveStatus } from "@/lib/pilot-go-live";
import { checkPermission } from "@/lib/require-permission";

const pilotTestStatuses: PilotTestStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
];

type ActionResult = {
  success?: string;
  error?: string;
};

const defaultPilotTests = [
  {
    title: "Menu request test",
    description: "Customer asks: Please send menu",
  },
  {
    title: "Delivery fee test",
    description: "Customer asks: How much is delivery to their area?",
  },
  {
    title: "Order creation test",
    description: "Customer says: I want [food name]",
  },
  {
    title: "Address capture test",
    description: "Customer sends delivery address after order starts.",
  },
  {
    title: "AI suggestion test",
    description:
      "Staff generates AI reply suggestion and edits before sending.",
  },
  {
    title: "Human takeover test",
    description: "Staff takes over conversation and sends manual reply.",
  },
  {
    title: "Order status update test",
    description: "Staff marks order confirmed/preparing/ready/delivered.",
  },
  {
    title: "Blocked AI safety test",
    description: "Customer complains/refund request. AI should not auto-reply.",
  },
];

async function ensurePilotPermission(): Promise<ActionResult | null> {
  const allowed = await checkPermission("manage_settings");

  return allowed
    ? null
    : { error: "You do not have permission to manage pilot setup." };
}

export async function createPilotClient(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const businessName = String(formData.get("businessName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!businessName) return { error: "Business name is required." };
  if (!phone) return { error: "Phone number is required." };

  await prisma.pilotClient.create({
    data: {
      restaurantId: restaurant.id,
      businessName,
      phone,
      contactName: String(formData.get("contactName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      instagram: String(formData.get("instagram") || "").trim(),
      businessType: String(formData.get("businessType") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      status: "NEW",
      checklist: {
        create: [
          { title: "Collect business details" },
          { title: "Add restaurant profile" },
          { title: "Add menu items" },
          { title: "Add delivery zones" },
          { title: "Create automation rules" },
          { title: "Test WhatsApp webhook" },
          { title: "Review inbox and order flow" },
          { title: "Confirm pilot pricing" },
        ],
      },
      tests: {
        create: defaultPilotTests,
      },
    },
  });

  revalidatePath("/dashboard/pilots");

  return { success: "Pilot client added successfully." };
}

export async function updatePilotTestStatus(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const pilotId = String(formData.get("pilotId") || "");
  const submittedStatus = String(formData.get("status") || "NOT_STARTED");
  const notes = String(formData.get("notes") || "").trim();

  if (!pilotTestStatuses.includes(submittedStatus as PilotTestStatus)) {
    return { error: "Invalid pilot test status." };
  }

  const status = submittedStatus as PilotTestStatus;

  const test = await prisma.pilotTest.findFirst({
    where: {
      id,
      pilotId,
      pilot: {
        restaurantId: restaurant.id,
      },
    },
  });

  if (!test) {
    return { error: "Pilot test not found." };
  }

  await prisma.pilotTest.update({
    where: { id },
    data: {
      status,
      notes,
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilotId}`);
  revalidatePath(`/dashboard/pilots/${pilotId}/testing`);

  return { success: "Pilot test updated." };
}

export async function createDefaultPilotTests(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const pilotId = String(formData.get("pilotId") || "");

  if (!pilotId) {
    return { error: "Pilot client is required." };
  }

  const pilot = await prisma.pilotClient.findFirst({
    where: {
      id: pilotId,
      restaurantId: restaurant.id,
    },
    include: {
      tests: true,
    },
  });

  if (!pilot) {
    return { error: "Pilot not found." };
  }

  if (pilot.tests.length > 0) {
    return { error: "Pilot already has tests." };
  }

  await prisma.pilotTest.createMany({
    data: defaultPilotTests.map((test) => ({
      pilotId: pilot.id,
      ...test,
    })),
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilot.id}`);
  revalidatePath(`/dashboard/pilots/${pilot.id}/testing`);

  return { success: "Default pilot tests created." };
}

export async function approvePilotGoLive(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const pilotId = String(formData.get("pilotId") || "");
  const goLiveNotes = String(formData.get("goLiveNotes") || "").trim();

  if (!pilotId) {
    return { error: "Pilot client is required." };
  }

  const pilot = await prisma.pilotClient.findFirst({
    where: {
      id: pilotId,
      restaurantId: restaurant.id,
    },
    include: {
      tests: true,
    },
  });

  if (!pilot) {
    return { error: "Pilot not found." };
  }

  const goLive = getPilotGoLiveStatus(pilot.tests);

  if (!goLive.canGoLive) {
    return {
      error:
        "Pilot cannot go live yet. Complete all required tests before approval.",
    };
  }

  await prisma.pilotClient.update({
    where: { id: pilot.id },
    data: {
      goLiveApproved: true,
      goLiveApprovedAt: new Date(),
      goLiveNotes,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilot.id}`);
  revalidatePath(`/dashboard/pilots/${pilot.id}/testing`);

  return { success: "Pilot approved for go-live." };
}

export async function revokePilotGoLive(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const pilotId = String(formData.get("pilotId") || "");

  if (!pilotId) {
    return { error: "Pilot client is required." };
  }

  const pilot = await prisma.pilotClient.findFirst({
    where: {
      id: pilotId,
      restaurantId: restaurant.id,
    },
  });

  if (!pilot) {
    return { error: "Pilot not found." };
  }

  await prisma.pilotClient.update({
    where: { id: pilot.id },
    data: {
      goLiveApproved: false,
      goLiveApprovedAt: null,
      status: "LIVE_TESTING",
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilot.id}`);
  revalidatePath(`/dashboard/pilots/${pilot.id}/testing`);

  return { success: "Go-live approval revoked." };
}

export async function updatePilotStatus(formData: FormData) {
  const permissionError = await ensurePilotPermission();
  if (permissionError) throw new Error(permissionError.error);

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as PilotStatus;

  await prisma.pilotClient.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: { status },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${id}`);
}

export async function deletePilotClient(formData: FormData) {
  const permissionError = await ensurePilotPermission();
  if (permissionError) throw new Error(permissionError.error);

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");

  await prisma.pilotClient.delete({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath("/dashboard/pilots");
}

export async function updatePilotFollowUp(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");
  const nextContactAt = String(formData.get("nextContactAt") || "");
  const followUpNotes = String(formData.get("followUpNotes") || "");

  if (!id) {
    return { error: "Pilot client is required." };
  }

  await prisma.pilotClient.update({
    where: {
      id,
      restaurantId: restaurant.id,
    },
    data: {
      lastContactedAt: new Date(),
      nextContactAt: nextContactAt ? new Date(nextContactAt) : null,
      followUpNotes,
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${id}`);

  return { success: "Follow-up updated successfully." };
}

export async function togglePilotChecklistItem(formData: FormData) {
  const permissionError = await ensurePilotPermission();
  if (permissionError) throw new Error(permissionError.error);

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const id = String(formData.get("id") || "");
  const pilotId = String(formData.get("pilotId") || "");
  const completed = String(formData.get("completed") || "") === "true";

  const item = await prisma.pilotChecklistItem.findFirst({
    where: {
      id,
      pilot: {
        id: pilotId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!item) {
    throw new Error("Checklist item not found.");
  }

  await prisma.pilotChecklistItem.update({
    where: { id },
    data: {
      completed: !completed,
    },
  });

  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilotId}`);
}

export async function convertPilotToRestaurant(
  formData: FormData
): Promise<ActionResult> {
  const permissionError = await ensurePilotPermission();
  if (permissionError) return permissionError;

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const pilotId = String(formData.get("pilotId") || "");

  if (!pilotId) {
    return { error: "Pilot client is required." };
  }

  const pilot = await prisma.pilotClient.findFirst({
    where: {
      id: pilotId,
      restaurantId: restaurant.id,
    },
    include: {
      checklist: true,
      tests: true,
    },
  });

  if (!pilot) {
    return { error: "Pilot client not found." };
  }

  const goLive = getPilotGoLiveStatus(pilot.tests);

  if (!pilot.goLiveApproved || !goLive.canGoLive) {
    return {
      error:
        "Pilot must pass required tests and be approved for go-live before conversion.",
    };
  }

  await prisma.restaurant.update({
    where: {
      id: restaurant.id,
    },
    data: {
      name: pilot.businessName,
      whatsappNumber: pilot.phone,
      address: pilot.location || restaurant.address,
    },
  });

  await prisma.pilotClient.update({
    where: {
      id: pilot.id,
    },
    data: {
      status: "ACTIVE",
    },
  });

  await prisma.pilotChecklistItem.updateMany({
    where: {
      pilotId: pilot.id,
      title: {
        in: [
          "Collect business details",
          "Add restaurant profile",
          "Confirm pilot pricing",
        ],
      },
    },
    data: {
      completed: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/pilots");
  revalidatePath(`/dashboard/pilots/${pilot.id}`);

  return {
    success: "Pilot converted into active restaurant setup.",
  };
}
