export const planLimits = {
  starter: {
    menuItems: 15,
    automations: 5,
    deliveryZones: 3,
    monthlyMessages: 300,
    agents: 1,
    monthlyAIEvents: 100,
    monthlyAITokens: 50000,
    monthlyMediaGenerations: 5,
    monthlyMediaCostLimit: 1,
  },
  growth: {
    menuItems: 75,
    automations: 25,
    deliveryZones: 15,
    monthlyMessages: 2000,
    agents: 3,
    monthlyAIEvents: 1000,
    monthlyAITokens: 500000,
    monthlyMediaGenerations: 50,
    monthlyMediaCostLimit: 10,
  },
  premium: {
    menuItems: 300,
    automations: 100,
    deliveryZones: 50,
    monthlyMessages: 10000,
    agents: 10,
    monthlyAIEvents: 5000,
    monthlyAITokens: 2500000,
    monthlyMediaGenerations: 200,
    monthlyMediaCostLimit: 40,
  },
};

export type PlanId = keyof typeof planLimits;

export function getPlanLimits(plan?: string) {
  if (plan === "growth" || plan === "premium" || plan === "starter") {
    return planLimits[plan];
  }

  return planLimits.starter;
}
