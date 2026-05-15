export function estimateAICost({
  model,
  promptTokens,
  outputTokens,
}: {
  model: string;
  promptTokens: number;
  outputTokens: number;
}) {
  const pricing: Record<
    string,
    {
      inputPerMillion: number;
      outputPerMillion: number;
    }
  > = {
    "openai:gpt-5.2-mini": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "openai:gpt-5-mini": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "gpt-5-mini": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "gpt-5.2-mini": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "replicate:ibm-granite/granite-3.3-8b-instruct": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "replicate:openai/gpt-oss-20b": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
    "replicate:qwen/qwen3-235b-a22b-instruct-2507": {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    },
  };

  const selected = pricing[model] || pricing["openai:gpt-5-mini"];

  const inputCost = (promptTokens / 1_000_000) * selected.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * selected.outputPerMillion;

  return Number((inputCost + outputCost).toFixed(6));
}
