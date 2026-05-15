import type {
  AITextProvider,
  GenerateTextParams,
  GenerateTextResult,
} from "@/lib/ai/providers/types";

const defaultReplicateModels = [
  "ibm-granite/granite-3.3-8b-instruct",
  "openai/gpt-oss-20b",
  "qwen/qwen3-235b-a22b-instruct-2507",
];

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getReplicateModels(model?: string) {
  return uniqueValues([
    model?.includes("/") ? model : "",
    process.env.REPLICATE_TEXT_MODEL_PRIMARY || "",
    process.env.REPLICATE_TEXT_MODEL || "",
    process.env.REPLICATE_TEXT_MODEL_FALLBACK || "",
    process.env.REPLICATE_TEXT_MODEL_PREMIUM || "",
    ...defaultReplicateModels,
  ]);
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function normalizeOutput(output: unknown): string {
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    return output
      .map((item) => (typeof item === "string" ? item : ""))
      .join("")
      .trim();
  }

  if (output && typeof output === "object") {
    const record = output as Record<string, unknown>;
    const text = record.text || record.output || record.response;

    if (typeof text === "string") return text;
  }

  return "";
}

async function runReplicateModel({
  model,
  instructions,
  input,
}: GenerateTextParams & { model: string }): Promise<GenerateTextResult> {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured.");
  }

  const response = await fetch(
    `https://api.replicate.com/v1/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          prompt: input,
          system_prompt: instructions,
          max_tokens: 180,
          temperature: 0.2,
          top_p: 0.9,
        },
      }),
    }
  );

  const prediction = await response.json();

  if (!response.ok) {
    const detail =
      typeof prediction?.detail === "string"
        ? prediction.detail
        : `Replicate request failed with status ${response.status}.`;

    throw new Error(detail);
  }

  if (prediction.status === "failed" || prediction.error) {
    throw new Error(
      typeof prediction.error === "string"
        ? prediction.error
        : `Replicate model ${model} failed.`
    );
  }

  const text = normalizeOutput(prediction.output);

  if (!text) {
    throw new Error(`Replicate model ${model} returned an empty response.`);
  }

  return {
    text,
    provider: "replicate",
    model,
    promptTokens: estimateTokens(`${instructions}\n\n${input}`),
    outputTokens: estimateTokens(text),
  };
}

export const replicateProvider: AITextProvider = {
  name: "replicate",

  async generateText(params: GenerateTextParams) {
    const models = getReplicateModels(params.model);
    const errors: string[] = [];

    for (const model of models) {
      try {
        return await runReplicateModel({
          ...params,
          model,
        });
      } catch (error) {
        errors.push(
          `${model}: ${
            error instanceof Error ? error.message : "Unknown Replicate error."
          }`
        );
      }
    }

    throw new Error(
      `All Replicate text models failed. ${errors.join(" | ")}`
    );
  },
};
