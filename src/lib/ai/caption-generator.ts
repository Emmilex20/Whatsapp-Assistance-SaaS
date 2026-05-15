import { getAITextProvider } from "@/lib/ai/providers";
import { prisma } from "@/lib/prisma";

export async function generateMediaCaption({
  restaurantId,
  mediaGenerationId,
}: {
  restaurantId: string;
  mediaGenerationId: string;
}) {
  if (process.env.AI_RESPONSES_ENABLED !== "true") {
    return {
      skipped: true,
      caption:
        "AI captions are disabled. Set AI_RESPONSES_ENABLED=true to generate captions.",
    };
  }

  const media = await prisma.mediaGeneration.findFirst({
    where: {
      id: mediaGenerationId,
      restaurantId,
    },
    include: {
      restaurant: true,
    },
  });

  if (!media) {
    return {
      skipped: true,
      caption: "Media generation not found.",
    };
  }

  const provider = getAITextProvider();

  const instructions = `
You are a social media caption writer for a Nigerian restaurant.

Write ONE short promotional caption.

Rules:
- Match the restaurant brand tone.
- Make it suitable for WhatsApp status and Instagram.
- Include a clear call-to-action.
- Use emojis lightly.
- Do not invent discounts, prices, phone numbers, or delivery promises unless provided.
- Keep it under 70 words.
`.trim();

  const input = `
Restaurant: ${media.restaurant.name}
Slogan: ${media.restaurant.brandSlogan || "Not provided"}
Brand tone: ${media.restaurant.brandTone || "Warm and friendly"}
Visual style: ${media.restaurant.brandVisualStyle || "Modern food advert"}

Promo image prompt:
${media.prompt}

Write the best caption.
`.trim();

  const result = await provider.generateText({
    model: process.env.AI_MODEL || "gpt-5-mini",
    instructions,
    input,
  });

  const caption = result.text || "No caption generated.";

  await prisma.mediaGeneration.update({
    where: { id: media.id },
    data: { caption },
  });

  return {
    skipped: false,
    caption,
  };
}
