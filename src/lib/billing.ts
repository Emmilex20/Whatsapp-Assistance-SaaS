import { prisma } from "@/lib/prisma";

type PaystackChargePayload = {
  data?: {
    amount?: number;
    currency?: string;
    paid_at?: string;
    created_at?: string;
    reference?: string;
    status?: string;
    metadata?: {
      restaurantId?: string;
      planId?: string;
    };
  };
};

export async function getRestaurantBilling(restaurantId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      restaurantId,
    },
  });

  return subscription;
}

export async function getBillingHistory(restaurantId: string) {
  const events = await prisma.webhookEvent.findMany({
    where: {
      provider: "paystack",
      eventType: "charge.success",
      processed: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return events
    .map((event) => {
      const payload = event.payload as PaystackChargePayload;
      const data = payload.data;

      if (data?.metadata?.restaurantId !== restaurantId) return null;

      const plan = data.metadata.planId || "starter";
      const amount = data.amount || 0;
      const paidAt = data.paid_at || data.created_at || event.createdAt;
      const reference = data.reference || event.reference || event.id;
      const status = data.status === "success" ? "Paid" : data.status || "Paid";

      return {
        invoice: `INV-${reference.slice(-8).toUpperCase()}`,
        reference,
        plan: getPlanLabel(plan),
        amount: `₦${Math.round(amount / 100).toLocaleString()}`,
        status,
        date: new Date(paidAt).toLocaleDateString(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getNextBillingDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

export function getPlanLabel(plan: string) {
  const labels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    premium: "Premium",
  };

  return labels[plan] || "Starter";
}

export function getPlanPrice(plan: string) {
  const prices: Record<string, string> = {
    starter: "₦10,000",
    growth: "₦25,000",
    premium: "₦50,000",
  };

  return prices[plan] || "₦10,000";
}
