import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Clock,
  Lightbulb,
  MessageSquareText,
  ShoppingBag,
  UserRoundCheck,
} from "lucide-react";
import { getRestaurantAnalytics } from "@/lib/analytics";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function AnalyticsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const analytics = restaurant
    ? await getRestaurantAnalytics(restaurant.id)
    : null;

  const stats = [
    {
      label: "Conversations",
      value: analytics?.totalConversations || 0,
      change: "Live",
      description: "Customers who contacted the restaurant",
      icon: MessageSquareText,
    },
    {
      label: "Customer messages",
      value: analytics?.totalCustomerMessages || 0,
      change: "Live",
      description: "Incoming WhatsApp messages",
      icon: ShoppingBag,
    },
    {
      label: "Bot replies",
      value: analytics?.totalBotReplies || 0,
      change: "Live",
      description: "Replies handled by assistant",
      icon: Bot,
    },
    {
      label: "Human replies",
      value: analytics?.totalHumanReplies || 0,
      change: "Live",
      description: "Manual replies from business owner",
      icon: UserRoundCheck,
    },
  ];

  const busiestPeak = Math.max(
    ...(analytics?.busiestHours.map((hour) => hour.messages) || [1])
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Restaurant analytics
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Understand your WhatsApp customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            These numbers now come from real conversations, messages, and saved automation rules.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
          Live database data
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Icon size={18} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                  {stat.change}
                  <ArrowUpRight size={13} />
                </span>
              </div>

              <p className="text-sm text-zinc-500">{stat.label}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{stat.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Busiest message hours
              </h2>
              <p className="text-sm text-zinc-500">
                Hours when customers send the most messages.
              </p>
            </div>

            <Clock size={18} className="text-emerald-400" />
          </div>

          <div className="space-y-4">
            {analytics?.busiestHours.length ? (
              analytics.busiestHours.map((hour) => (
                <div key={hour.time}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{hour.time}</span>
                    <span className="text-white">{hour.messages} messages</span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.max(
                          Math.round((hour.messages / busiestPeak) * 100),
                          8
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No message activity yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Common customer keywords
              </h2>
              <p className="text-sm text-zinc-500">
                Words customers use most in messages.
              </p>
            </div>

            <MessageSquareText size={18} className="text-emerald-400" />
          </div>

          <div className="space-y-3">
            {analytics?.popularKeywords.length ? (
              analytics.popularKeywords.map((item) => (
                <div
                  key={item.keyword}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium capitalize text-white">
                        {item.keyword}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Mentioned {item.count} times
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Keyword
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No customer keywords yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Automation performance
              </h2>
              <p className="text-sm text-zinc-500">
                How often each automation has been triggered.
              </p>
            </div>

            <BarChart3 size={18} className="text-emerald-400" />
          </div>

          <div className="space-y-3">
            {analytics?.automations.length ? (
              analytics.automations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Triggers: {item.triggers.join(", ")}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {item.usedCount} uses
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No automation performance yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <Lightbulb size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Growth suggestions
              </h2>
              <p className="text-sm text-zinc-300">
                Simple recommendations based on the data we have.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              analytics?.totalCustomerMessages
                ? "Customers are already messaging. Keep menu and delivery replies updated."
                : "Send test WhatsApp messages to start collecting analytics.",
              analytics?.totalHumanReplies
                ? "Human takeover is being used. Review these chats to improve automation rules."
                : "No human replies yet. Bot automation may be handling messages well, or you need more test conversations.",
              analytics?.automations.length
                ? "Automation rules exist. Watch usage count to know which customer questions matter most."
                : "Create at least 3 automations: menu, delivery, and order.",
            ].map((tip, index) => (
              <div
                key={tip}
                className="rounded-2xl border border-emerald-400/20 bg-zinc-950/40 p-4"
              >
                <p className="text-sm leading-6 text-zinc-200">
                  <span className="mr-2 text-emerald-300">
                    Tip {index + 1}:
                  </span>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
