import Link from "next/link";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { buildRestaurantAIContext } from "@/lib/ai/restaurant-context";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function AIContextPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const context = restaurant
    ? await buildRestaurantAIContext(restaurant.id)
    : "No restaurant found.";

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/settings/ai"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to AI settings
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          AI context preview
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          What AI currently knows
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          This preview shows the restaurant data passed into AI suggestions. If
          something is wrong here, update menu, delivery zones, FAQs,
          automations, or knowledge base.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <BrainCircuit size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Context safety check
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              AI should only answer from this data. Keep this context clean,
              accurate, and updated before enabling AI auto-reply.
            </p>
          </div>
        </div>
      </section>

      <pre className="max-h-[620px] overflow-auto rounded-3xl border border-white/10 bg-zinc-950 p-5 text-xs leading-6 text-zinc-300">
        {context}
      </pre>
    </div>
  );
}
