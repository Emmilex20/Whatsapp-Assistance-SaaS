import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const response = await fetch(`${appUrl}/api/webhooks/whatsapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
