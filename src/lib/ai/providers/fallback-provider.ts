import { openAIProvider } from "@/lib/ai/providers/openai-provider";
import { replicateProvider } from "@/lib/ai/providers/replicate-provider";
import type {
  AITextProvider,
  GenerateTextParams,
} from "@/lib/ai/providers/types";

export const openAIWithReplicateFallbackProvider: AITextProvider = {
  name: "openai",

  async generateText(params: GenerateTextParams) {
    try {
      return await openAIProvider.generateText(params);
    } catch (error) {
      console.error("OpenAI text generation failed. Trying Replicate.", error);

      return replicateProvider.generateText({
        ...params,
        model: process.env.REPLICATE_TEXT_MODEL_PRIMARY,
      });
    }
  },
};
