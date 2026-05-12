import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billingHistory, billingPlans } from "@/lib/site";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Billing</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Manage subscription
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Choose a plan for the restaurant assistant. Billing is powered by Paystack.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Current plan: Growth
            </h2>
            <p className="text-sm text-zinc-300">
              Renewal placeholder: June 12, 2026.
            </p>
          </div>
        </div>
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
                <div key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check size={16} className="text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>

            <Button className="mt-6 h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200">
              Choose {plan.name}
            </Button>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
        <div className="mb-5 flex items-center gap-3">
          <CreditCard size={18} className="text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-white">Billing history</h2>
            <p className="text-sm text-zinc-500">Recent subscription payments.</p>
          </div>
        </div>

        <div className="space-y-3">
          {billingHistory.map((item) => (
            <div
              key={item.invoice}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.invoice}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.plan} plan · {item.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-white">{item.amount}</p>
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