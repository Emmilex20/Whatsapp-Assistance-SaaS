import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Edit3,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAutomation,
  toggleAutomationStatus,
} from "@/actions/restaurant";
import { automationTemplates } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function AutomationsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const automations = restaurant
    ? await prisma.automation.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const activeCount = automations.filter((rule) => rule.status === "ACTIVE").length;
  const totalUsed = automations.reduce((sum, rule) => sum + rule.usedCount, 0);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Automation builder
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Create smart WhatsApp replies
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Set simple rules like: when a customer says “menu”, your assistant
            sends the restaurant menu automatically.
          </p>
        </div>

        <Link href="/dashboard/automations/new">
          <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            <Plus className="mr-2" size={16} />
            New automation
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <Workflow size={18} />
          </div>
          <h2 className="text-base font-semibold text-white">
            Simple rule logic
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Every automation follows one easy pattern: customer trigger → assistant response.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <p className="text-sm text-zinc-500">Active rules</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {activeCount}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Currently replying automatically.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <p className="text-sm text-zinc-500">Automation usage</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {totalUsed}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Total triggered replies.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Active automations
              </h2>
              <p className="text-sm text-zinc-500">
                Rules your assistant can use during WhatsApp chats.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {automations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No automation rules yet. Create your first rule for menu, delivery, or order replies.
              </div>
            ) : (
              automations.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white">
                          {rule.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            rule.status === "ACTIVE"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : rule.status === "PAUSED"
                              ? "bg-zinc-400/10 text-zinc-300"
                              : "bg-yellow-400/10 text-yellow-300"
                          }`}
                        >
                          {rule.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-400">
                        <span className="text-zinc-500">Triggers:</span>{" "}
                        {rule.triggers.join(", ")}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        <span className="text-zinc-500">Response:</span>{" "}
                        {rule.response}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        Used {rule.usedCount} times
                      </span>

                      <Link href={`/dashboard/automations/${rule.id}/edit`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                        >
                          <Edit3 size={14} />
                        </Button>
                      </Link>

                      <form action={toggleAutomationStatus}>
                        <input type="hidden" name="id" value={rule.id} />
                        <input type="hidden" name="status" value={rule.status} />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                        >
                          {rule.status === "ACTIVE" ? (
                            <>
                              <PauseCircle className="mr-1.5" size={14} />
                              Pause
                            </>
                          ) : (
                            <>
                              <PlayCircle className="mr-1.5" size={14} />
                              Resume
                            </>
                          )}
                        </Button>
                      </form>

                      <form action={deleteAutomation}>
                        <input type="hidden" name="id" value={rule.id} />
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

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">
            Quick templates
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Start from common restaurant automations.
          </p>

          <div className="mt-5 space-y-3">
            {automationTemplates.map((template) => (
              <Link
                href="/dashboard/automations/new"
                key={template.title}
                className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {template.title}
                    </p>
                    <p className="mt-1 text-xs text-emerald-400">
                      Trigger: {template.trigger}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-zinc-500" />
                </div>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {template.response}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Example conversation
            </h2>
            <p className="text-sm text-zinc-500">
              How an automation behaves in real WhatsApp chats.
            </p>
          </div>
        </div>

        <div className="mt-5 max-w-2xl space-y-3">
          <div className="max-w-[80%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
            Please send menu
          </div>

          <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white">
            Sure 😊 Here is today’s menu with prices.
          </div>
        </div>
      </section>
    </div>
  );
}
