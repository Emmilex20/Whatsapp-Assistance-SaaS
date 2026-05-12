type SendWhatsAppTextParams = {
  to: string;
  message: string;
  phoneNumberId?: string;
};

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppText({
  to,
  message,
  phoneNumberId,
}: SendWhatsAppTextParams) {
  const senderPhoneNumberId = phoneNumberId || WHATSAPP_PHONE_NUMBER_ID;

  if (!senderPhoneNumberId || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error("Missing WhatsApp environment variables.");
  }

  const endpoint = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${senderPhoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp send error:", data);
    throw new Error("Failed to send WhatsApp message.");
  }

  return data;
}

export function getAutomationReply(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("menu") ||
    normalized.includes("food") ||
    normalized.includes("price")
  ) {
    return "Sure 😊 Here is today’s menu: Jollof Rice ₦3,500, Beef Shawarma ₦2,800, Egusi & Pounded Yam ₦4,000.";
  }

  if (
    normalized.includes("delivery") ||
    normalized.includes("deliver") ||
    normalized.includes("location")
  ) {
    return "Yes, we deliver within selected areas. Delivery fee depends on your exact location.";
  }

  if (
    normalized.includes("open") ||
    normalized.includes("time") ||
    normalized.includes("close")
  ) {
    return "We are open from 9:00 AM to 9:00 PM every day.";
  }

  if (
    normalized.includes("order") ||
    normalized.includes("buy") ||
    normalized.includes("want")
  ) {
    return "Great 😊 Please tell us what you want to order, quantity, delivery address, and payment method.";
  }

  return null;
}
