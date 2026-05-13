import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack-webhook";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getNextBillingDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const isValid = verifyPaystackSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event || "unknown";
    const reference =
      event.data?.reference ||
      event.data?.subscription_code ||
      event.data?.customer?.customer_code ||
      undefined;

    if (reference) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { reference },
      });

      if (existing) {
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider: "paystack",
        eventType,
        reference,
        payload: event,
        processed: false,
      },
    });

    if (eventType === "charge.success") {
      const metadata = event.data?.metadata;
      const restaurantId = metadata?.restaurantId;
      const planId = metadata?.planId;
      const customerCode = event.data?.customer?.customer_code;
      const subscriptionCode = event.data?.subscription?.subscription_code;

      if (restaurantId && planId) {
        await prisma.subscription.upsert({
          where: {
            restaurantId,
          },
          update: {
            plan: planId,
            status: "ACTIVE",
            paystackCustomerCode: customerCode,
            paystackSubscriptionCode: subscriptionCode,
            currentPeriodEnd: getNextBillingDate(),
          },
          create: {
            restaurantId,
            plan: planId,
            status: "ACTIVE",
            paystackCustomerCode: customerCode,
            paystackSubscriptionCode: subscriptionCode,
            currentPeriodEnd: getNextBillingDate(),
          },
        });

        await prisma.webhookEvent.update({
          where: {
            id: webhookEvent.id,
          },
          data: {
            processed: true,
          },
        });
      }
    }

    if (eventType === "subscription.disable") {
      const subscriptionCode = event.data?.subscription_code;

      if (subscriptionCode) {
        await prisma.subscription.updateMany({
          where: {
            paystackSubscriptionCode: subscriptionCode,
          },
          data: {
            status: "CANCELLED",
          },
        });

        await prisma.webhookEvent.update({
          where: {
            id: webhookEvent.id,
          },
          data: {
            processed: true,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
