import Link from "next/link";
import { ArrowLeft, ShoppingBag, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { AIUpsellToggle } from "@/components/ai/ai-upsell-toggle";
import { CreateUpsellRuleForm } from "@/components/upsells/create-upsell-rule-form";
import { UpsellRuleCard } from "@/components/upsells/upsell-rule-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export default async function AIUpsellsPage() {
  await requirePermission("manage_ai");

  const restaurant = await getOrCreateCurrentRestaurant();

  const rules = restaurant
    ? await prisma.upsellRule.findMany({
        where: {
          restaurantId: restaurant.id,
        },
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const totals = {
    activeRules: rules.filter((rule) => rule.active).length,
    attempts: rules.reduce((sum, rule) => sum + rule.attempts, 0),
    accepted: rules.reduce((sum, rule) => sum + rule.acceptedUpsells, 0),
    revenue: rules.reduce((sum, rule) => sum + rule.revenueGenerated, 0),
  };

  const envEnabled = process.env.AI_UPSELLS_ENABLED === "true";

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/settings/ai"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to AI settings
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          AI upsell engine
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Smart restaurant upsells
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Suggest useful add-ons during order conversations without repeating
          the same offer too often.
        </p>
      </section>

      {restaurant && (
        <AIUpsellToggle
          enabled={restaurant.aiUpsellsEnabled}
          envEnabled={envEnabled}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active rules", value: totals.activeRules, icon: Sparkles },
          { label: "Upsell attempts", value: totals.attempts, icon: TrendingUp },
          { label: "Accepted upsells", value: totals.accepted, icon: ShoppingBag },
          {
            label: "Upsell revenue",
            value: `₦${totals.revenue.toLocaleString()}`,
            icon: Wallet,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <item.icon size={18} />
            </div>
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Frequency protection
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-100">
          ServeFlow avoids repeating the same upsell in a conversation for six
          hours and limits each customer to two upsell suggestions per day.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <CreateUpsellRuleForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Upsell rules</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Active rules can be added to AI-generated replies when order intent
            and menu matches are detected.
          </p>

          <div className="mt-5 space-y-3">
            {rules.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No upsell rules yet"
                description="Create your first rule, such as suggesting a drink when a customer orders rice or shawarma."
              />
            ) : (
              rules.map((rule) => (
                <UpsellRuleCard key={rule.id} rule={rule} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
