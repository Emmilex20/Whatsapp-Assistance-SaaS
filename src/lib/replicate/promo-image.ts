import { getReplicateClient } from "@/lib/replicate/client";

type ReplicateModelRef = `${string}/${string}` | `${string}/${string}:${string}`;

function getOutputUrl(output: unknown) {
  const firstOutput = Array.isArray(output) ? output[0] : output;

  if (!firstOutput) return "";
  if (typeof firstOutput === "string") return firstOutput;

  if (typeof firstOutput === "object") {
    const maybeFile = firstOutput as { url?: () => URL | string };

    if (typeof maybeFile.url === "function") {
      return String(maybeFile.url());
    }
  }

  return String(firstOutput);
}

export async function generatePromoImage(prompt: string) {
  if (process.env.MEDIA_GENERATION_ENABLED !== "true") {
    return {
      skipped: true,
      outputUrl: "",
      message: "Media generation is disabled.",
    };
  }

  const replicate = getReplicateClient();
  const model = (process.env.REPLICATE_IMAGE_MODEL ||
    "black-forest-labs/flux-schnell") as ReplicateModelRef;

  const output = await replicate.run(model, {
    input: {
      prompt,
    },
  });

  const outputUrl = getOutputUrl(output);

  return {
    skipped: false,
    outputUrl,
    message: outputUrl
      ? "Promo image generated."
      : "Promo image generated without an output URL.",
  };
}
