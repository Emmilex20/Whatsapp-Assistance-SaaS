import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNextBillingDate } from "@/lib/billing";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

type BillingCallbackPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function BillingCallbackPage({
  searchParams,
}: BillingCallbackPageProps) {
  const params = await searchParams;
  const reference = params.reference || "";
  const restaurant = await getOrCreateCurrentRestaurant();

  let success = false;
  let message =
    "We could not find a payment reference. If payment was completed, wait a moment and refresh billing history.";

  if (reference && restaurant) {
    try {
      const transaction = await verifyPaystackTransaction(reference);
      const metadata = transaction.metadata || {};
      const restaurantId = metadata.restaurantId || restaurant.id;
      const planId = metadata.planId || "starter";

      if (transaction.status === "success" && restaurantId === restaurant.id) {
        await prisma.subscription.upsert({
          where: {
            restaurantId: restaurant.id,
          },
          update: {
            plan: planId,
            status: "ACTIVE",
            paystackCustomerCode: transaction.customer?.customer_code,
            paystackSubscriptionCode:
              transaction.subscription?.subscription_code,
            currentPeriodEnd: getNextBillingDate(),
          },
          create: {
            restaurantId: restaurant.id,
            plan: planId,
            status: "ACTIVE",
            paystackCustomerCode: transaction.customer?.customer_code,
            paystackSubscriptionCode:
              transaction.subscription?.subscription_code,
            currentPeriodEnd: getNextBillingDate(),
          },
        });

        await prisma.webhookEvent.upsert({
          where: { reference },
          update: {
            payload: {
              event: "charge.success",
              data: transaction,
            },
            processed: true,
          },
          create: {
            provider: "paystack",
            eventType: "charge.success",
            reference,
            payload: {
              event: "charge.success",
              data: transaction,
            },
            processed: true,
          },
        });

        success = true;
        message =
          "Payment was verified successfully. Your subscription and billing history have been updated.";
      } else {
        message =
          "Payment verification did not return a successful transaction for this restaurant.";
      }
    } catch (error) {
      console.error("Billing callback verification error:", error);
      message =
        "Unable to verify the payment right now. If Paystack confirms it, the webhook may update your billing history shortly.";
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/3 p-6 text-center">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            success
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-yellow-400/10 text-yellow-300"
          }`}
        >
          {success ? <CheckCircle2 size={24} /> : <CircleAlert size={24} />}
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          {success ? "Payment verified" : "Payment verification pending"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>

        <Link href="/dashboard/billing">
          <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            Back to billing
          </Button>
        </Link>
      </div>
    </div>
  );
}
