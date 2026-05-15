import { getOpenAIClient } from "@/lib/ai/client";
import type {
  AITextProvider,
  GenerateTextParams,
} from "@/lib/ai/providers/types";

export const openAIProvider: AITextProvider = {
  name: "openai",

  async generateText({ instructions, input, model }: GenerateTextParams) {
    const client = getOpenAIClient();
    const selectedModel =
      model === "gpt-5.2-mini"
        ? "gpt-5-mini"
        : model || process.env.AI_MODEL || "gpt-5-mini";

    const response = await client.responses.create({
      model: selectedModel,
      instructions,
      input,
    });

    return {
      text: response.output_text || "",
      provider: "openai",
      model: selectedModel,
      promptTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
    };
  },
};
