import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { deleteFAQ } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { CreateFAQForm } from "@/components/faqs/create-faq-form";
import { CreateRecommendedFAQsButton } from "@/components/faqs/create-recommended-faqs-button";
import { recommendedFAQPresets } from "@/lib/faq-presets";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export default async function FaqsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const faqs = restaurant
    ? await prisma.fAQ.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            FAQ automation
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Common customer questions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Add answers your assistant can use when customers ask about
            delivery, location, payment, or opening hours.
          </p>
        </div>

        <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          <Plus className="mr-2" size={16} />
          Add FAQ
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <CreateFAQForm />

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Recommended FAQs
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Save common restaurant FAQs for delivery, menu, payment, orders,
              support, and promos.
            </p>

            <div className="mt-5">
              <CreateRecommendedFAQsButton />
            </div>

            <div className="mt-5 space-y-3">
              {recommendedFAQPresets.map((preset) => (
                <div
                  key={preset.question}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      {preset.question}
                    </p>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                      {preset.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {preset.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">Saved FAQs</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your assistant can use these answers in WhatsApp conversations.
          </p>

          <div className="mt-5 space-y-3">
            {faqs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No FAQs yet. Add your first common customer question.
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {faq.question}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/automations/faqs/${faq.id}/edit`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                        >
                          <Edit3 size={14} />
                        </Button>
                      </Link>

                      <form action={deleteFAQ}>
                        <input type="hidden" name="id" value={faq.id} />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
