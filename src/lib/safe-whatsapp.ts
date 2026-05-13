import { sendWhatsAppText } from "@/lib/whatsapp";

type SafeSendWhatsAppTextParams = {
  to: string;
  message: string;
};

export async function safeSendWhatsAppText({
  to,
  message,
}: SafeSendWhatsAppTextParams) {
  const enabled = process.env.WHATSAPP_SEND_ENABLED === "true";

  if (!enabled) {
    console.log("WhatsApp sending disabled. Message preview:", {
      to,
      message,
    });

    return {
      skipped: true,
      reason: "WHATSAPP_SEND_ENABLED is false",
    };
  }

  try {
    return await sendWhatsAppText({
      to,
      message,
    });
  } catch (error) {
    console.error("Safe WhatsApp send failed:", error);

    return {
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown WhatsApp error",
    };
  }
}
