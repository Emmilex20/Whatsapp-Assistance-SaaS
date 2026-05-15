import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { TrialStatusBanner } from "@/components/billing/trial-status-banner";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import {
  getBillingHistory,
  getPlanLabel,
  getPlanPrice,
  getRestaurantBilling,
} from "@/lib/billing";
import { getMonthlyAIUsage } from "@/lib/ai/usage-limits";
import { getMonthlyMediaUsage } from "@/lib/media/usage-limits";
import { billingPlans } from "@/lib/site";
import { getRestaurantUsage } from "@/lib/usage";
import { requirePermission } from "@/lib/require-permission";
import {
  getCurrentTrialAccessStatus,
  isPaidSubscriptionActive,
} from "@/lib/trial-access";

export default async function BillingPage() {
  await requirePermission("manage_billing");

  const restaurant = await getOrCreateCurrentRestaurant();
  const subscription = restaurant
    ? await getRestaurantBilling(restaurant.id)
    : null;
  const usage = restaurant ? await getRestaurantUsage(restaurant.id) : null;
  const aiUsage = restaurant ? await getMonthlyAIUsage(restaurant.id) : null;
  const mediaUsage = restaurant
    ? await getMonthlyMediaUsage(restaurant.id)
    : null;
  const billingHistory = restaurant ? await getBillingHistory(restaurant.id) : [];
  const access = await getCurrentTrialAccessStatus();

  const currentPlan = subscription?.plan || "starter";
  const currentStatus = subscription?.status || "FREE";
  const paidSubscriptionActive = isPaidSubscriptionActive(subscription);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Billing</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Manage subscription
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Choose a plan for the Business assistant. Billing is powered by
          Paystack.
        </p>
      </section>

      <TrialStatusBanner access={access} />

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Current plan:{" "}
              {paidSubscriptionActive ? getPlanLabel(currentPlan) : "Free trial"}
            </h2>
            <p className="text-sm text-zinc-300">
              Status: {currentStatus}
              {subscription?.currentPeriodEnd
                ? ` · Renews ${subscription.currentPeriodEnd.toLocaleDateString()}`
                : " · No renewal date yet"}
            </p>
          </div>
        </div>
      </section>

      {usage && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Menu items",
              value: usage.usage.menuItems,
              limit: usage.limits.menuItems,
            },
            {
              label: "Automations",
              value: usage.usage.automations,
              limit: usage.limits.automations,
            },
            {
              label: "Delivery zones",
              value: usage.usage.deliveryZones,
              limit: usage.limits.deliveryZones,
            },
            {
              label: "Messages",
              value: usage.usage.messages,
              limit: usage.limits.monthlyMessages,
            },
            {
              label: "Agents",
              value: usage.usage.agents,
              limit: usage.limits.agents,
            },
          ].map((item) => {
            const percent = Math.min((item.value / item.limit) * 100, 100);

            return (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/3 p-5"
              >
                <p className="text-sm text-zinc-500">{item.label}</p>

                <div className="mt-2 flex items-end gap-1">
                  <h2 className="text-2xl font-semibold text-white">
                    {item.value}
                  </h2>
                  <span className="mb-1 text-sm text-zinc-500">
                    / {item.limit}
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {aiUsage && (
        <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            AI usage this month
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-100">
            Current plan: {aiUsage.plan}. AI usage is limited to protect your
            monthly costs.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                label: "AI events",
                value: aiUsage.usage.totalEvents,
                limit: aiUsage.limits.monthlyAIEvents,
              },
              {
                label: "AI tokens",
                value: aiUsage.usage.totalTokens,
                limit: aiUsage.limits.monthlyAITokens,
              },
            ].map((item) => {
              const percent = Math.min((item.value / item.limit) * 100, 100);

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-300">{item.label}</p>
                    <p className="text-sm font-semibold text-white">
                      {item.value.toLocaleString()} /{" "}
                      {item.limit.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {mediaUsage && (
        <section className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            Media usage this month
          </h2>

          <p className="mt-2 text-sm leading-6 text-purple-100">
            Current plan: {mediaUsage.plan}. Media generation is limited because
            Replicate can become expensive.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Generations",
                value: mediaUsage.usage.totalGenerations,
                limit: mediaUsage.limits.monthlyMediaGenerations,
              },
              {
                label: "Estimated cost",
                value: mediaUsage.usage.totalCost,
                limit: mediaUsage.limits.monthlyMediaCostLimit,
                money: true,
              },
            ].map((item) => {
              const percent = Math.min((item.value / item.limit) * 100, 100);

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-300">{item.label}</p>

                    <p className="text-sm font-semibold text-white">
                      {item.money
                        ? `$${item.value.toFixed(3)} / $${item.limit}`
                        : `${item.value.toLocaleString()} / ${item.limit.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Paystack webhook endpoint
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-100">
          Add this URL inside your Paystack dashboard webhook settings after
          deployment:
        </p>
        <code className="mt-3 block rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-300">
          https://serveflow-taupe.vercel.app/api/webhooks/paystack
        </code>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {billingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl border p-5 ${
              plan.popular
                ? "border-emerald-400/40 bg-emerald-400/10"
                : "border-white/10 bg-white/3"
            }`}
          >
            {plan.popular && (
              <div className="mb-4 w-fit rounded-full bg-emerald-500 px-3 py-1 text-xs text-white">
                Recommended
              </div>
            )}

            <h2 className="text-base font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {plan.description}
            </p>

            <div className="mt-5">
              <span className="text-2xl font-semibold text-white">
                {plan.price}
              </span>
              <span className="text-sm text-zinc-500"> / month</span>
            </div>

            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-zinc-300"
                >
                  <Check size={16} className="text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>

            {currentPlan === plan.id && (
              <p className="mt-3 text-xs text-emerald-300">
                {paidSubscriptionActive
                  ? `You are currently on the ${getPlanLabel(
                      currentPlan
                    )} plan at ${getPlanPrice(currentPlan)} / month.`
                  : "You can subscribe to this plan to continue after your free trial."}
              </p>
            )}

            <CheckoutButton
              planId={plan.id}
              label={
                paidSubscriptionActive && currentPlan === plan.id
                  ? "Current plan"
                  : `Choose ${plan.name}`
              }
              disabled={paidSubscriptionActive && currentPlan === plan.id}
            />
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
        <div className="mb-5 flex items-center gap-3">
          <CreditCard size={18} className="text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Billing history
            </h2>
            <p className="text-sm text-zinc-500">
              Recent subscription payments.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {billingHistory.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No real billing payments recorded yet. Completed Paystack charges
              will appear here after callback or webhook verification.
            </div>
          )}

          {billingHistory.map((item) => (
            <div
              key={item.reference}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {item.invoice}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.plan} plan · {item.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-white">
                  {item.amount}
                </p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
