import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { updateFAQ } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFAQPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const faq = restaurant
    ? await prisma.fAQ.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
      })
    : null;

  if (!faq) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/automations/faqs"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to FAQs
        </Link>

        <p className="text-sm font-medium text-emerald-400">Edit FAQ</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Update customer answer
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Keep common customer questions accurate so the assistant gives better replies.
        </p>
      </section>

      <form
        action={updateFAQ}
        className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <input type="hidden" name="id" value={faq.id} />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Question</label>
            <Input
              name="question"
              required
              defaultValue={faq.question}
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Answer</label>
            <textarea
              name="answer"
              required
              defaultValue={faq.answer}
              className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
            />
          </div>
        </div>

        <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          Save changes
        </Button>
      </form>
    </div>
  );
}
