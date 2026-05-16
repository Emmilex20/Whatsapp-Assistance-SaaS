import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const allowed = await checkPermission("manage_inbox");

  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const restaurant = await getOrCreateCurrentRestaurant();
  const { id } = await params;

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const transcription = await prisma.voiceTranscription.findFirst({
    where: {
      id,
      restaurantId: restaurant.id,
    },
  });

  if (!transcription?.audioData) {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(transcription.audioData), {
    headers: {
      "Content-Type": transcription.mimeType || "audio/ogg",
      "Cache-Control": "private, max-age=300",
    },
  });
}
