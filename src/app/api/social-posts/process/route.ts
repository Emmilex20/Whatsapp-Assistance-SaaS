import { NextRequest, NextResponse } from "next/server";
import { processDueSocialCampaignPosts } from "@/lib/social-posting";

async function processRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const results = await processDueSocialCampaignPosts();

  return NextResponse.json({
    processed: results.length,
    results,
  });
}

export async function GET(request: NextRequest) {
  return processRequest(request);
}

export async function POST(request: NextRequest) {
  return processRequest(request);
}
