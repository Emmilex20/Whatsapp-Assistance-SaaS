import { NextResponse } from "next/server";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getDashboardNotificationCounts } from "@/lib/dashboard-notifications";

export async function GET() {
  try {
    const restaurant = await getOrCreateCurrentRestaurant();
    const counts = await getDashboardNotificationCounts(restaurant?.id);

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Dashboard notification fetch failed:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard notifications." },
      { status: 500 }
    );
  }
}
