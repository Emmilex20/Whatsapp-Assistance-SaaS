import { NextRequest, NextResponse } from "next/server";
import { safeSendWhatsAppText } from "@/lib/safe-whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.to || !body.message) {
      return NextResponse.json(
        { error: "Missing to or message." },
        { status: 400 }
      );
    }

    const result = await safeSendWhatsAppText({
      to: body.to,
      message: body.message,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Test send error:", error);

    return NextResponse.json(
      { error: "Failed to send test message." },
      { status: 500 }
    );
  }
}
