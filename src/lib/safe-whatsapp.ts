import { sendWhatsAppText } from "@/lib/whatsapp";

type SafeSendWhatsAppTextParams = {
  to: string;
  message: string;
  phoneNumberId?: string;
};

export async function safeSendWhatsAppText({
  to,
  message,
  phoneNumberId,
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
      phoneNumberId,
    });
  } catch (error) {
    console.warn("WhatsApp send failed:", error);

    return {
      skipped: true,
      reason: "WhatsApp send failed",
    };
  }
}
