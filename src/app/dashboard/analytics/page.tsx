import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import { getRestaurantAnalytics } from "@/lib/analytics";
import { getRestaurantBilling } from "@/lib/billing";
import { getCampaignAnalytics } from "@/lib/campaign-analytics";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getResolutionAnalytics } from "@/lib/resolution-analytics";
import { getSlaAnalytics } from "@/lib/sla-analytics";

export default async function AnalyticsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const analytics = restaurant
    ? await getRestaurantAnalytics(restaurant.id)
    : null;
  const subscription = restaurant
    ? await getRestaurantBilling(restaurant.id)
    : null;
  const currentPlan = subscription?.plan || "starter";
  const slaAnalytics = restaurant
    ? await getSlaAnalytics({
        restaurantId: restaurant.id,
        plan: currentPlan,
      })
    : null;
  const resolutionAnalytics = restaurant
    ? await getResolutionAnalytics(restaurant.id)
    : null;
  const campaignAnalytics = restaurant
    ? await getCampaignAnalytics(restaurant.id)
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

      {campaignAnalytics && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Campaigns", value: campaignAnalytics.totalCampaigns },
            {
              label: "Active campaigns",
              value: campaignAnalytics.activeCampaigns,
            },
            {
              label: "Promo inquiries",
              value: campaignAnalytics.totalInquiries,
            },
            {
              label: "Promo revenue",
              value: `₦${campaignAnalytics.totalRevenue.toLocaleString()}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-sm text-zinc-500">{item.label}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </h2>
            </div>
          ))}
        </section>
      )}

      {slaAnalytics && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "SLA compliance",
              value: `${slaAnalytics.complianceRate}%`,
              description: "Conversations replied within tracking scope",
              icon: ShieldCheck,
            },
            {
              label: "Needs reply",
              value: slaAnalytics.waiting,
              description: "Customers waiting for a response",
              icon: MessageSquareText,
            },
            {
              label: "Overdue",
              value: slaAnalytics.overdue,
              description: "Conversations past SLA target",
              icon: AlertTriangle,
            },
            {
              label: "Replied",
              value: slaAnalytics.replied,
              description: "Chats with a later bot or human response",
              icon: Bot,
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
              <p className="mt-2 text-sm text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {slaAnalytics && (
        <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
            <div className="mb-5 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-300" />
              <div>
                <h2 className="text-base font-semibold text-white">
                  Overdue conversations
                </h2>
                <p className="text-sm text-red-100">
                  Chats that need staff attention based on plan and priority
                  SLA.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {slaAnalytics.overdueConversations.length ? (
                slaAnalytics.overdueConversations.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/inbox?conversation=${item.id}`}
                    className="block rounded-2xl border border-red-400/20 bg-zinc-950/40 p-4 transition hover:bg-zinc-900"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.customerName}
                        </p>
                        <p className="mt-1 text-xs text-red-100">
                          {item.customerPhone}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300">
                          {item.minutesWaiting}m waiting
                        </span>
                        <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                          Target {item.targetMinutes}m
                        </span>
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-300">
                          {item.assignedTo}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-red-400/20 bg-zinc-950/40 p-5 text-sm text-red-100">
                  No overdue conversations right now.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Priority breakdown
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Conversation priority and overdue pressure.
            </p>

            <div className="mt-5 space-y-3">
              {slaAnalytics.priorityBreakdown.map((item) => (
                <div
                  key={item.priority}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      {item.priority}
                    </p>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {item.count} chats
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {item.overdue} overdue
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {resolutionAnalytics && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Open",
              value: resolutionAnalytics.open,
              icon: CircleDot,
            },
            {
              label: "Pending",
              value: resolutionAnalytics.pending,
              icon: Timer,
            },
            {
              label: "Resolved",
              value: resolutionAnalytics.resolved,
              icon: CheckCircle2,
            },
            {
              label: "Resolution rate",
              value: `${resolutionAnalytics.resolutionRate}%`,
              icon: CheckCircle2,
            },
            {
              label: "Avg resolution",
              value: `${resolutionAnalytics.averageResolutionMinutes}m`,
              icon: Timer,
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
      )}

      {resolutionAnalytics && (
        <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Agent resolution breakdown
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              See how conversations are being closed across team members.
            </p>

            <div className="mt-5 space-y-3">
              {resolutionAnalytics.agentBreakdown.map((agent) => (
                <div
                  key={agent.name}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {agent.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Conversation ownership
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                        {agent.resolved} resolved
                      </span>
                      <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                        {agent.pending} pending
                      </span>
                      <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                        {agent.open} open
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Recently resolved
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Latest closed customer conversations.
            </p>

            <div className="mt-5 space-y-3">
              {resolutionAnalytics.recentResolved.length ? (
                resolutionAnalytics.recentResolved.map((conversation) => (
                  <a
                    key={conversation.id}
                    href={`/dashboard/inbox?conversation=${conversation.id}`}
                    className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                  >
                    <p className="text-sm font-medium text-white">
                      {conversation.customerName ||
                        conversation.customerPhone}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Resolved {conversation.resolvedAt?.toLocaleString()}
                    </p>
                  </a>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                  No resolved conversations yet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

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

          {slaAnalytics && (
            <div className="mt-5 rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
              <h2 className="text-base font-semibold text-white">
                SLA insight
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Current plan: {currentPlan}. Your SLA compliance is{" "}
                {slaAnalytics.complianceRate}%. Keep overdue conversations low
                by assigning urgent chats to agents quickly and using human
                takeover when the bot cannot resolve the issue.
              </p>
            </div>
          )}
        </div>
      </section>

      {resolutionAnalytics && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            Resolution insight
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Your current resolution rate is{" "}
            {resolutionAnalytics.resolutionRate}%. Keep conversations clean by
            marking completed customer issues as resolved after orders,
            payments, or questions are fully handled.
          </p>
        </section>
      )}
    </div>
  );
}
