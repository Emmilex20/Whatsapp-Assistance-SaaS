type SendWhatsAppTextParams = {
  to: string;
  message: string;
  accessToken?: string;
  phoneNumberId?: string;
};

export async function sendWhatsAppText({
  to,
  message,
  accessToken,
  phoneNumberId: providedPhoneNumberId,
}: SendWhatsAppTextParams) {
  const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId =
    providedPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
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
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp send failed:", data);
    throw new Error(data?.error?.message || "WhatsApp message failed.");
  }

  return data;
}
