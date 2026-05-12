type InitializePaymentParams = {
  email: string;
  amount: number;
  plan?: string;
  metadata?: Record<string, unknown>;
};

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getPaystackPlanCode(planId: string) {
  const plans: Record<string, string | undefined> = {
    starter: process.env.PAYSTACK_STARTER_PLAN_CODE,
    growth: process.env.PAYSTACK_GROWTH_PLAN_CODE,
    premium: process.env.PAYSTACK_PREMIUM_PLAN_CODE,
  };

  return plans[planId];
}

export async function initializePaystackPayment({
  email,
  amount,
  plan,
  metadata,
}: InitializePaymentParams) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      plan,
      callback_url: `${APP_URL}/dashboard/billing/callback`,
      metadata,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    console.error("Paystack initialize error:", data);
    throw new Error("Failed to initialize Paystack payment.");
  }

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.status) {
    console.error("Paystack verify error:", data);
    throw new Error("Failed to verify Paystack transaction.");
  }

  return data.data;
}