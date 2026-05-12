import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/site";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-zinc-950 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium text-emerald-400">Simple pricing</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Start small. Upgrade when the restaurant grows.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            These are placeholder prices for now. We’ll refine pricing later before launch.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
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

              <h3 className="text-base font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {plan.description}
              </p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-semibold text-white">
                  {plan.price}
                </span>
                <span className="mb-1 text-sm text-zinc-500">/month</span>
              </div>

              <div className="mt-5 space-y-3">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={16} className="text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>

              <Button className="mt-6 h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200">
                Choose plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}