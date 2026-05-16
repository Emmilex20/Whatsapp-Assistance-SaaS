"use server";

import { revalidatePath } from "next/cache";
import {
  BusinessInsightPeriod,
  generateBusinessInsights,
} from "@/lib/business-insights";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

export async function regenerateBusinessInsights(formData: FormData) {
  const allowed = await checkPermission("manage_reports");

  if (!allowed) {
    return { error: "You do not have permission to manage insights." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const requestedPeriod = String(formData.get("period") || "WEEKLY");
  const period: BusinessInsightPeriod =
    requestedPeriod === "MONTHLY" ? "MONTHLY" : "WEEKLY";

  const result = await generateBusinessInsights(restaurant.id, period);

  await prisma.businessInsight.createMany({
    data: result.insights.map((insight) => ({
      restaurantId: restaurant.id,
      period,
      category: insight.category,
      title: insight.title,
      summary: insight.summary,
      recommendation: insight.recommendation,
      metricLabel: insight.metricLabel || null,
      metricValue:
        insight.metricValue === undefined ? null : String(insight.metricValue),
      priority: insight.priority,
    })),
  });

  revalidatePath("/dashboard/insights");

  return {
    success: `${period.toLowerCase()} insights archived.`,
  };
}
