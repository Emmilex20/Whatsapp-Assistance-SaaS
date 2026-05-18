import { getCurrentDbUser } from "@/lib/current-user";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getRestaurantBilling } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export const FREE_TRIAL_DAYS = 3;

type TrialSubscription = {
  status: string;
  currentPeriodEnd: Date | null;
} | null;

type TrialUser = {
  createdAt: Date;
};

export type TrialAccessStatus = {
  allowed: boolean;
  paid: boolean;
  trialActive: boolean;
  trialExpired: boolean;
  trialEndsAt: Date;
  daysRemaining: number;
  label: string;
};

export function getTrialEndsAt(createdAt: Date) {
  const endsAt = new Date(createdAt);
  endsAt.setDate(endsAt.getDate() + FREE_TRIAL_DAYS);
  return endsAt;
}

export function isPaidSubscriptionActive(subscription: TrialSubscription) {
  if (!subscription || subscription.status !== "ACTIVE") return false;

  if (!subscription.currentPeriodEnd) return true;

  return subscription.currentPeriodEnd >= new Date();
}

export function getTrialAccessStatus({
  user,
  subscription,
}: {
  user: TrialUser;
  subscription: TrialSubscription;
}): TrialAccessStatus {
  const now = new Date();
  const trialEndsAt = getTrialEndsAt(user.createdAt);
  const paid = isPaidSubscriptionActive(subscription);
  const trialActive = !paid && trialEndsAt >= now;
  const trialExpired = !paid && !trialActive;
  const msRemaining = Math.max(trialEndsAt.getTime() - now.getTime(), 0);
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return {
    allowed: paid || trialActive,
    paid,
    trialActive,
    trialExpired,
    trialEndsAt,
    daysRemaining,
    label: paid
      ? "Subscription active"
      : trialActive
        ? `${daysRemaining} trial day${daysRemaining === 1 ? "" : "s"} left`
        : "Trial expired",
  };
}

export async function getCurrentTrialAccessStatus() {
  const user = await getCurrentDbUser();
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!user || !restaurant) return null;

  const subscription = await getRestaurantBilling(restaurant.id);

  return getTrialAccessStatus({
    user: restaurant,
    subscription,
  });
}

export async function canUseRestaurantAfterTrial(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    include: {
      subscription: true,
    },
  });

  if (!restaurant) {
    return {
      allowed: false,
      reason: "Restaurant not found.",
    };
  }

  const subscription = restaurant.subscription;
  const access = getTrialAccessStatus({
    user: restaurant,
    subscription,
  });

  return {
    allowed: access.allowed,
    reason: access.allowed
      ? ""
      : "Your 3-day free trial has ended. Subscribe to continue using ServeFlow.",
    access,
  };
}

export async function getRestaurantTrialAccessStatus(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    include: {
      subscription: true,
    },
  });

  if (!restaurant) return null;

  return getTrialAccessStatus({
    user: restaurant,
    subscription: restaurant.subscription,
  });
}
