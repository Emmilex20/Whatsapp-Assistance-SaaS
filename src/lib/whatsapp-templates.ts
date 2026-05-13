type SendWhatsAppTemplateParams = {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
};

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "en",
  parameters = [],
}: SendWhatsAppTemplateParams) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!token) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured.");
  }

  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: parameters.length
            ? [
                {
                  type: "body",
                  parameters: parameters.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : [],
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp template send failed:", data);
    throw new Error(data?.error?.message || "WhatsApp template failed.");
  }

  return data;
}
