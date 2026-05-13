import { NextRequest, NextResponse } from "next/server";
import { generateAIAutoReply } from "@/lib/ai/auto-reply";
import { matchAutomation } from "@/lib/automation-matcher";
import {
  saveBotMessage,
  saveIncomingCustomerMessage,
} from "@/lib/conversations";
import { buildDeliveryReply, isDeliveryRequest } from "@/lib/delivery-reply";
import { buildMenuReply, isMenuRequest } from "@/lib/menu-reply";
import { prisma } from "@/lib/prisma";
import { safeSendWhatsAppText } from "@/lib/safe-whatsapp";
import { handleWhatsAppOrder } from "@/lib/whatsapp-orders";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Webhook verification failed." },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const phoneNumberId = value?.metadata?.phone_number_id;
    const from = message.from;
    const text = message.text?.body;
    const contactName = value?.contacts?.[0]?.profile?.name;

    console.log("WhatsApp webhook received:", {
      phoneNumberId,
      from,
      hasText: Boolean(text),
    });

    if (!phoneNumberId || !from || !text) {
      return NextResponse.json({ received: true });
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        whatsappPhoneNumberId: phoneNumberId,
      },
    });

    if (!restaurant) {
      console.warn("No restaurant found for phone_number_id:", phoneNumberId);
      return NextResponse.json({ received: true });
    }

    const conversation = await saveIncomingCustomerMessage({
      restaurantId: restaurant.id,
      customerPhone: from,
      customerName: contactName,
      message: text,
    });

    if (conversation.status !== "HUMAN_TAKEOVER" && isMenuRequest(text)) {
      const menuReply = await buildMenuReply(restaurant.id);

      await safeSendWhatsAppText({
        to: from,
        message: menuReply,
      });

      await saveBotMessage({
        conversationId: conversation.id,
        message: menuReply,
      });

      return NextResponse.json({ received: true });
    }

    const activeOrder = await prisma.order.findFirst({
      where: {
        restaurantId: restaurant.id,
        conversationId: conversation.id,
        status: {
          in: ["NEW", "CONFIRMED", "PREPARING", "READY"],
        },
      },
      select: {
        id: true,
      },
    });

    if (activeOrder) {
      const orderResult = await handleWhatsAppOrder({
        restaurantId: restaurant.id,
        conversationId: conversation.id,
        customerName: contactName,
        customerPhone: from,
        message: text,
      });

      if (orderResult) {
        await safeSendWhatsAppText({
          to: from,
          message: orderResult.reply,
        });

        await saveBotMessage({
          conversationId: conversation.id,
          message: orderResult.reply,
        });

        return NextResponse.json({ received: true });
      }
    }

    if (conversation.status !== "HUMAN_TAKEOVER" && isDeliveryRequest(text)) {
      const deliveryReply = await buildDeliveryReply({
        restaurantId: restaurant.id,
        message: text,
      });

      await safeSendWhatsAppText({
        to: from,
        message: deliveryReply,
      });

      await saveBotMessage({
        conversationId: conversation.id,
        message: deliveryReply,
      });

      return NextResponse.json({ received: true });
    }

    const orderResult = await handleWhatsAppOrder({
      restaurantId: restaurant.id,
      conversationId: conversation.id,
      customerName: contactName,
      customerPhone: from,
      message: text,
    });

    if (orderResult) {
      await safeSendWhatsAppText({
        to: from,
        message: orderResult.reply,
      });

      await saveBotMessage({
        conversationId: conversation.id,
        message: orderResult.reply,
      });

      return NextResponse.json({ received: true });
    }

    if (conversation.status === "HUMAN_TAKEOVER") {
      return NextResponse.json({ received: true });
    }

    const automation = await matchAutomation({
      restaurantId: restaurant.id,
      message: text,
    });

    if (!automation) {
      if (
        restaurant.aiAutoReplyEnabled &&
        conversation.status !== "HUMAN_TAKEOVER"
      ) {
        const aiResult = await generateAIAutoReply({
          restaurantId: restaurant.id,
          conversationId: conversation.id,
          latestCustomerMessage: text,
        });

        if (!aiResult.blocked && aiResult.reply) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderType: "BOT",
              content: aiResult.reply,
            },
          });

          await safeSendWhatsAppText({
            to: from,
            message: aiResult.reply,
          });
        }

        if (aiResult.blocked) {
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              priority: "HIGH",
              workflowStatus: "OPEN",
              internalNotes: `AI auto-reply blocked: ${aiResult.reason}`,
            },
          });
        }
      }

      return NextResponse.json({ received: true });
    }

    await safeSendWhatsAppText({
      to: from,
      message: automation.response,
    });

    await saveBotMessage({
      conversationId: conversation.id,
      message: automation.response,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
