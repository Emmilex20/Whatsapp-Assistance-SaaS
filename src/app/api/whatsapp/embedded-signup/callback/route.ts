import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";
import { encryptWhatsAppToken } from "@/lib/whatsapp-token-encryption";

type EmbeddedSignupPayload = {
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessId?: string;
};

async function exchangeCodeForToken(code: string) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!appId || !appSecret) {
    return {
      token: null,
      error: "Meta app credentials are not configured.",
    };
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/oauth/access_token?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await response.json();

  if (!response.ok) {
    return {
      token: null,
      error: data?.error?.message || "Meta code exchange failed.",
    };
  }

  return {
    token: String(data.access_token || ""),
    error: "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const allowed = await checkPermission("manage_whatsapp");

    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const restaurant = await getOrCreateCurrentRestaurant();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as EmbeddedSignupPayload;
    const code = String(body.code || "").trim();
    const wabaId = String(body.wabaId || "").trim();
    const phoneNumberId = String(body.phoneNumberId || "").trim();
    const businessId = String(body.businessId || "").trim();

    if (!code) {
      return NextResponse.json(
        { error: "Meta authorization code is required." },
        { status: 400 }
      );
    }

    const tokenResult = await exchangeCodeForToken(code);
    const encryptedToken = tokenResult.token
      ? encryptWhatsAppToken(tokenResult.token)
      : null;

    await prisma.restaurant.update({
      where: {
        id: restaurant.id,
      },
      data: {
        whatsappBusinessAccountId: wabaId || restaurant.whatsappBusinessAccountId,
        whatsappPhoneNumberId: phoneNumberId || restaurant.whatsappPhoneNumberId,
        whatsappConnectionStatus:
          tokenResult.token && encryptedToken
            ? "CONNECTED"
            : "CONNECTED_PENDING_TOKEN_STORAGE",
        whatsappConnectedAt: new Date(),
        whatsappAccessTokenEncrypted: encryptedToken?.encrypted,
        whatsappAccessTokenIv: encryptedToken?.iv,
        whatsappAccessTokenTag: encryptedToken?.tag,
      },
    });

    return NextResponse.json({
      success: true,
      tokenStored: Boolean(encryptedToken),
      tokenExchangeError: tokenResult.error,
      businessId,
      wabaId,
      phoneNumberId,
    });
  } catch (error) {
    console.error("Embedded Signup callback failed:", error);

    return NextResponse.json(
      { error: "Failed to save WhatsApp connection." },
      { status: 500 }
    );
  }
}
