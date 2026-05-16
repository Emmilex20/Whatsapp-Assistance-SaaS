import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { checkPermission } from "@/lib/require-permission";
import { safeSendWhatsAppText } from "@/lib/safe-whatsapp";

export async function POST(request: NextRequest) {
  try {
    const allowed = await checkPermission("manage_whatsapp");

    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const restaurant = await getOrCreateCurrentRestaurant();
    const body = await request.json();

    const to = String(body.to || "").trim();
    const message = String(body.message || "").trim();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient and message are required." },
        { status: 400 }
      );
    }

    const result = await safeSendWhatsAppText({
      restaurantId: restaurant?.id,
      to,
      message,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("WhatsApp test send error:", error);

    return NextResponse.json(
      { error: "Failed to send test WhatsApp message." },
      { status: 500 }
    );
  }
}
