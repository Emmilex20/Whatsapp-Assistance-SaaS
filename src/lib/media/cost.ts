export function estimateMediaCost(model: string) {
  const pricing: Record<string, number> = {
    "black-forest-labs/flux-schnell": 0.003,
  };

  return pricing[model] || 0.01;
}
