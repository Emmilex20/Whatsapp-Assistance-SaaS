import { sendWhatsAppTemplate } from "@/lib/whatsapp-templates";

type SafeSendWhatsAppTemplateParams = {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
};

export async function safeSendWhatsAppTemplate({
  to,
  templateName,
  languageCode,
  parameters,
}: SafeSendWhatsAppTemplateParams) {
  if (process.env.WHATSAPP_SEND_ENABLED !== "true") {
    console.log("WhatsApp template sending disabled:", {
      to,
      templateName,
      languageCode,
      parameters,
    });

    return { skipped: true };
  }

  try {
    return await sendWhatsAppTemplate({
      to,
      templateName,
      languageCode,
      parameters,
    });
  } catch (error) {
    console.error("Safe template send failed:", error);

    return {
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown template error",
    };
  }
}
