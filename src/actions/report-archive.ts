"use server";

import type { ReportArchiveType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getMonthlyOperationsReport } from "@/lib/monthly-operations";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { getWeeklyOperationsReport } from "@/lib/weekly-operations";

export async function saveReportArchive(formData: FormData) {
  const allowed = await checkPermission("manage_reports");

  if (!allowed) {
    return { error: "You do not have permission to manage reports." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const type = String(formData.get("type") || "WEEKLY") as ReportArchiveType;

  const monthlyReport =
    type === "MONTHLY"
      ? await getMonthlyOperationsReport(restaurant.id)
      : null;
  const report =
    monthlyReport || (await getWeeklyOperationsReport(restaurant.id));

  const title = `${restaurant.name} ${type.toLowerCase()} report`;

  await prisma.reportArchive.create({
    data: {
      restaurantId: restaurant.id,
      type,
      title,
      periodStart: report.start,
      periodEnd: report.end,
      messages: report.messages,
      orders: report.orders,
      revenue: report.revenue,
      campaignPosts: report.campaignPosts.length,
      missedPosts: report.missedPosts.length,
      aiEvents: monthlyReport?.ai.events || 0,
      mediaAssets: monthlyReport?.media.generations || 0,
      summaryNote:
        type === "MONTHLY"
          ? `Monthly report saved with ${report.messages} messages, ${report.orders} orders, and ₦${report.revenue.toLocaleString()} revenue.`
          : `Weekly report saved with ${report.messages} messages, ${report.orders} orders, and ₦${report.revenue.toLocaleString()} revenue.`,
    },
  });

  revalidatePath("/dashboard/reports/archive");

  return { success: "Report archived successfully." };
}

export async function deleteReportArchive(formData: FormData) {
  const allowed = await checkPermission("manage_reports");

  if (!allowed) {
    return { error: "You do not have permission to manage reports." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const id = String(formData.get("id") || "");

  const archive = await prisma.reportArchive.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!archive) {
    return { error: "Archive not found." };
  }

  await prisma.reportArchive.delete({
    where: { id },
  });

  revalidatePath("/dashboard/reports/archive");

  return { success: "Archived report deleted." };
}
