export const planLimits = {
  starter: {
    menuItems: 15,
    automations: 5,
    deliveryZones: 3,
    monthlyMessages: 300,
    agents: 1,
  },
  growth: {
    menuItems: 75,
    automations: 25,
    deliveryZones: 15,
    monthlyMessages: 2000,
    agents: 3,
  },
  premium: {
    menuItems: 300,
    automations: 100,
    deliveryZones: 50,
    monthlyMessages: 10000,
    agents: 10,
  },
};

export type PlanId = keyof typeof planLimits;

export function getPlanLimits(plan?: string) {
  if (plan === "growth" || plan === "premium" || plan === "starter") {
    return planLimits[plan];
  }

  return planLimits.starter;
}
