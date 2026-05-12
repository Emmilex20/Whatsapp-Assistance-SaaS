import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const transaction = await verifyPaystackTransaction(reference);

    return NextResponse.json({
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      customer: transaction.customer,
      metadata: transaction.metadata,
    });
  } catch (error) {
    console.error("Billing verify error:", error);

    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}