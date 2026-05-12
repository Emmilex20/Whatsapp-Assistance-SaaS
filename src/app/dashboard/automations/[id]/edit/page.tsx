import Link from "next/link";
import { ArrowLeft, Bot, MessageSquareText, Workflow } from "lucide-react";
import { notFound } from "next/navigation";
import { updateAutomation } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAutomationPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const automation = restaurant
    ? await prisma.automation.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
      })
    : null;

  if (!automation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/automations"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to automations
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Edit automation rule
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Update WhatsApp auto-reply
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Improve triggers and response text based on what customers actually ask.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          action={updateAutomation}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <input type="hidden" name="id" value={automation.id} />

          <h2 className="text-base font-semibold text-white">
            Automation details
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Keep triggers short and natural.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Automation name</label>
              <Input
                name="name"
                required
                defaultValue={automation.name}
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">
                Customer trigger keywords
              </label>
              <Input
                name="triggers"
                required
                defaultValue={automation.triggers.join(", ")}
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
              <p className="text-xs leading-5 text-zinc-500">
                Separate keywords with commas. Example: menu, food, price list.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Assistant reply</label>
              <textarea
                name="response"
                required
                defaultValue={automation.response}
                className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
              />
            </div>

            <Button className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400">
              Save changes
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Current workflow
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              This is how this automation currently behaves.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                    <MessageSquareText size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Customer trigger
                    </p>
                    <p className="text-xs text-zinc-500">
                      {automation.triggers.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-4 h-6 border-l border-dashed border-white/20" />

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Workflow size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Rule status
                    </p>
                    <p className="text-xs text-zinc-500">
                      {automation.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-4 h-6 border-l border-dashed border-white/20" />

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <Bot size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Assistant response
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {automation.response}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Improvement tip
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              After real customers start messaging, check analytics keywords and add those words as triggers to improve matching.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
