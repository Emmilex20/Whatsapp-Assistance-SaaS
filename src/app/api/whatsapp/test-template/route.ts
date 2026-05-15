import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/require-permission";
import { safeSendWhatsAppTemplate } from "@/lib/safe-whatsapp-template";

export async function POST(request: NextRequest) {
  try {
    const allowed = await checkPermission("manage_whatsapp");

    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await request.json();

    const to = String(body.to || "").trim();
    const templateName = String(body.templateName || "").trim();
    const languageCode = String(body.languageCode || "en").trim();
    const parameters = Array.isArray(body.parameters)
      ? body.parameters.map(String)
      : [];

    if (!to || !templateName) {
      return NextResponse.json(
        { error: "Recipient and template name are required." },
        { status: 400 }
      );
    }

    const result = await safeSendWhatsAppTemplate({
      to,
      templateName,
      languageCode,
      parameters,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Template test error:", error);

    return NextResponse.json(
      { error: "Failed to send template message." },
      { status: 500 }
    );
  }
}
