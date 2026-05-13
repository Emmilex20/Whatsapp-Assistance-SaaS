import { NextRequest, NextResponse } from "next/server";
import {
  getPaystackPlanCode,
  initializePaystackPayment,
} from "@/lib/paystack";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

const planAmounts: Record<string, number> = {
  starter: 1000000,
  growth: 2500000,
  premium: 5000000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email;
    const planId = body.planId;

    if (!email || !planId) {
      return NextResponse.json(
        { error: "Email and planId are required." },
        { status: 400 }
      );
    }

    const amount = planAmounts[planId];
    const planCode = getPaystackPlanCode(planId);

    if (!amount || !planCode) {
      return NextResponse.json(
        { error: "Invalid or unconfigured billing plan." },
        { status: 400 }
      );
    }

    const restaurant = await getOrCreateCurrentRestaurant();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const payment = await initializePaystackPayment({
      email,
      amount,
      plan: planCode,
      metadata: {
        planId,
        restaurantId: restaurant.id,
        product: "ServeFlow",
      },
    });

    return NextResponse.json({
      authorizationUrl: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (error) {
    console.error("Billing initialize error:", error);

    return NextResponse.json(
      { error: "Unable to initialize payment." },
      { status: 500 }
    );
  }
}
