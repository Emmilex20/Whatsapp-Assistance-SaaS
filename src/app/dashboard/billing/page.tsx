import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import {
  getPlanLabel,
  getPlanPrice,
  getRestaurantBilling,
} from "@/lib/billing";
import { billingHistory, billingPlans } from "@/lib/site";
import { getRestaurantUsage } from "@/lib/usage";

export default async function BillingPage() {
  const restaurant = await getOrCreateCurrentRestaurant();
  const subscription = restaurant
    ? await getRestaurantBilling(restaurant.id)
    : null;
  const usage = restaurant ? await getRestaurantUsage(restaurant.id) : null;

  const currentPlan = subscription?.plan || "starter";
  const currentStatus = subscription?.status || "FREE";

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Billing</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Manage subscription
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Choose a plan for the restaurant assistant. Billing is powered by
          Paystack.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Current plan: {getPlanLabel(currentPlan)}
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
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          ].map((item) => {
            const percent = Math.min((item.value / item.limit) * 100, 100);

            return (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
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

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Paystack webhook endpoint
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-100">
          Add this URL inside your Paystack dashboard webhook settings after
          deployment:
        </p>
        <code className="mt-3 block rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-300">
          https://your-domain.com/api/webhooks/paystack
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
                You are currently on the {getPlanLabel(currentPlan)} plan at{" "}
                {getPlanPrice(currentPlan)} / month.
              </p>
            )}

            <CheckoutButton
              planId={plan.id}
              label={
                currentPlan === plan.id ? "Current plan" : `Choose ${plan.name}`
              }
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
          {billingHistory.map((item) => (
            <div
              key={item.invoice}
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
