import { sendWhatsAppText } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";
import { decryptWhatsAppToken } from "@/lib/whatsapp-token-encryption";

type SafeSendWhatsAppTextParams = {
  to: string;
  message: string;
  restaurantId?: string;
};

export async function safeSendWhatsAppText({
  to,
  message,
  restaurantId,
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
    let accessToken: string | undefined;
    let phoneNumberId: string | undefined;

    if (restaurantId) {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id: restaurantId,
        },
        select: {
          whatsappPhoneNumberId: true,
          whatsappAccessTokenEncrypted: true,
          whatsappAccessTokenIv: true,
          whatsappAccessTokenTag: true,
        },
      });

      if (
        restaurant?.whatsappAccessTokenEncrypted &&
        restaurant.whatsappAccessTokenIv &&
        restaurant.whatsappAccessTokenTag
      ) {
        accessToken =
          decryptWhatsAppToken({
            encrypted: restaurant.whatsappAccessTokenEncrypted,
            iv: restaurant.whatsappAccessTokenIv,
            tag: restaurant.whatsappAccessTokenTag,
          }) || undefined;
        phoneNumberId = restaurant.whatsappPhoneNumberId || undefined;
      }
    }

    return await sendWhatsAppText({
      to,
      message,
      accessToken,
      phoneNumberId,
    });
  } catch (error) {
    console.error("Safe WhatsApp send failed:", error);

    return {
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown WhatsApp error",
    };
  }
}
