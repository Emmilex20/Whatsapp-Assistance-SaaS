import { openAIWithReplicateFallbackProvider } from "@/lib/ai/providers/fallback-provider";
import { replicateProvider } from "@/lib/ai/providers/replicate-provider";

export function getAITextProvider() {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "replicate") {
    return replicateProvider;
  }

  return openAIWithReplicateFallbackProvider;
}
