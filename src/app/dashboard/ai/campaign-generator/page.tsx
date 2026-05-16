import Link from "next/link";
import { ArrowLeft, ImageIcon, Megaphone, Sparkles } from "lucide-react";
import { AICampaignGeneratorForm } from "@/components/campaigns/ai-campaign-generator-form";
import { estimateCampaignGeneratorCost } from "@/lib/ai/campaign-generator";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { requirePermission } from "@/lib/require-permission";

export default async function AICampaignGeneratorPage() {
  await requirePermission("manage_campaigns");

  const restaurant = await getOrCreateCurrentRestaurant();
  const estimatedCost = estimateCampaignGeneratorCost();

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/campaigns"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          AI campaign generator
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Generate full marketing campaigns
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Turn a goal, audience, and promo type into campaign copy for
          WhatsApp, Instagram, and your campaign planner.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Restaurant",
            value: restaurant?.name || "No restaurant",
            icon: Megaphone,
          },
          {
            label: "Estimated text cost",
            value: `$${estimatedCost.toFixed(6)}`,
            icon: Sparkles,
          },
          {
            label: "Optional media",
            value:
              process.env.MEDIA_GENERATION_ENABLED === "true"
                ? "Enabled"
                : "Disabled",
            icon: ImageIcon,
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
            <h2 className="mt-2 break-words text-2xl font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Review before saving
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Generated campaigns are drafts. Check offers, prices, delivery claims,
          and availability before saving or posting.
        </p>
      </section>

      <AICampaignGeneratorForm />
    </div>
  );
}
