import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CircleAlert,
  DollarSign,
  FileText,
  MessageSquareText,
  Zap,
} from "lucide-react";
import { getAIUsageAnalytics } from "@/lib/ai/usage-analytics";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { requirePermission } from "@/lib/require-permission";

export default async function AIUsagePage() {
  await requirePermission("manage_ai");

  const restaurant = await getOrCreateCurrentRestaurant();

  const usage = restaurant ? await getAIUsageAnalytics(restaurant.id) : null;

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

        <p className="text-sm font-medium text-emerald-400">AI usage</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          AI audit logs and cost tracking
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review AI suggestions, auto-replies, blocked attempts, estimated
          tokens, and estimated cost.
        </p>
      </section>

      {usage && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              {
                label: "AI events",
                value: usage.stats.totalEvents,
                icon: Zap,
              },
              {
                label: "Suggestions",
                value: usage.stats.suggestions,
                icon: MessageSquareText,
              },
              {
                label: "Auto replies",
                value: usage.stats.autoReplies,
                icon: Bot,
              },
              {
                label: "Blocked",
                value: usage.stats.blocked,
                icon: CircleAlert,
              },
              {
                label: "Tokens",
                value: usage.stats.totalTokens.toLocaleString(),
                icon: FileText,
              },
              {
                label: "Est. cost",
                value: `$${usage.stats.totalCost.toFixed(4)}`,
                icon: DollarSign,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Icon size={18} />
                  </div>

                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {item.value}
                  </h2>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Monthly AI events",
                value: usage.monthly.usage.totalEvents,
                limit: usage.monthly.limits.monthlyAIEvents,
              },
              {
                label: "Monthly AI tokens",
                value: usage.monthly.usage.totalTokens,
                limit: usage.monthly.limits.monthlyAITokens,
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
                      {item.value.toLocaleString()}
                    </h2>
                    <span className="mb-1 text-sm text-zinc-500">
                      / {item.limit.toLocaleString()}
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

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Recent AI events
            </h2>

            <div className="mt-5 space-y-3">
              {usage.logs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                  No AI usage yet.
                </div>
              ) : (
                usage.logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                            {log.eventType.replaceAll("_", " ")}
                          </span>

                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                            {log.model}
                          </span>

                          {log.conversation && (
                            <Link
                              href={`/dashboard/inbox?conversation=${log.conversation.id}`}
                              className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-400/20"
                            >
                              Open chat
                            </Link>
                          )}
                        </div>

                        {log.inputPreview && (
                          <p className="mt-3 text-sm leading-6 text-zinc-400">
                            <span className="text-zinc-500">Input:</span>{" "}
                            {log.inputPreview}
                          </p>
                        )}

                        {log.outputPreview && (
                          <p className="mt-2 text-sm leading-6 text-zinc-300">
                            <span className="text-zinc-500">Output:</span>{" "}
                            {log.outputPreview}
                          </p>
                        )}

                        {log.blockedReason && (
                          <p className="mt-2 text-sm leading-6 text-red-300">
                            Blocked: {log.blockedReason}
                          </p>
                        )}
                      </div>

                      <div className="min-w-40 rounded-2xl border border-white/10 bg-zinc-950/40 p-3 text-xs text-zinc-400">
                        <p>Tokens: {log.totalTokens.toLocaleString()}</p>
                        <p className="mt-1">
                          Cost: ${log.estimatedCost.toFixed(6)}
                        </p>
                        <p className="mt-1">{log.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Cost estimate note
        </h2>

        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Estimated cost is based on your configured helper rates. Update
          src/lib/ai/cost.ts whenever your AI provider/model pricing changes.
        </p>
      </section>
    </div>
  );
}
