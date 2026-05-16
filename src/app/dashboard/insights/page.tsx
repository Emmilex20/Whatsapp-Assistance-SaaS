import Link from "next/link";
import {
  Archive,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Wallet,
} from "lucide-react";
import { RegenerateInsightsButton } from "@/components/insights/regenerate-insights-button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  BusinessInsightCategory,
  BusinessInsightPeriod,
  GeneratedBusinessInsight,
  generateBusinessInsights,
} from "@/lib/business-insights";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

type InsightsPageProps = {
  searchParams: Promise<{
    period?: string;
  }>;
};

const sections: {
  key: BusinessInsightCategory;
  title: string;
  description: string;
  icon: typeof BarChart3;
}[] = [
  {
    key: "revenue",
    title: "Revenue insights",
    description: "Sales trends, average order value, and best sellers.",
    icon: Wallet,
  },
  {
    key: "customer",
    title: "Customer insights",
    description: "Customer behavior, conversion signals, and memory coverage.",
    icon: MessageSquareText,
  },
  {
    key: "campaign",
    title: "Campaign insights",
    description: "Campaign performance and posting discipline.",
    icon: Megaphone,
  },
  {
    key: "operations",
    title: "Operations insights",
    description: "Peak hours, complaint pressure, and cost awareness.",
    icon: BrainCircuit,
  },
];

function priorityClass(priority: string) {
  if (priority === "high") return "bg-red-400/10 text-red-300";
  if (priority === "medium") return "bg-yellow-400/10 text-yellow-300";
  return "bg-emerald-400/10 text-emerald-300";
}

function InsightCard({ insight }: { insight: GeneratedBusinessInsight }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
          <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
            {insight.summary}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${priorityClass(
            insight.priority
          )}`}
        >
          {insight.priority} priority
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
          Recommendation
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-300">
          {insight.recommendation}
        </p>
      </div>

      {insight.metricLabel && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
            {insight.metricLabel}: {insight.metricValue}
          </span>
        </div>
      )}
    </div>
  );
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  await requirePermission("manage_reports");

  const params = await searchParams;
  const period: BusinessInsightPeriod =
    params.period === "monthly" ? "MONTHLY" : "WEEKLY";
  const restaurant = await getOrCreateCurrentRestaurant();

  const generated = restaurant
    ? await generateBusinessInsights(restaurant.id, period)
    : null;

  const archives = restaurant
    ? await prisma.businessInsight.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : [];

  const insights = generated?.insights || [];
  const highPriority = insights.filter(
    (insight) => insight.priority === "high"
  ).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            AI business insights
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Restaurant intelligence
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Generate readable recommendations from sales, customers, campaigns,
            and operations data without adding extra AI cost.
          </p>
        </div>

        <div className="action-row no-scrollbar">
          <Link
            href="/dashboard/insights"
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              period === "WEEKLY"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Weekly
          </Link>

          <Link
            href="/dashboard/insights?period=monthly"
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              period === "MONTHLY"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Monthly
          </Link>

          <RegenerateInsightsButton period={period} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Generated insights",
            value: insights.length,
            icon: Sparkles,
          },
          {
            label: "High priority",
            value: highPriority,
            icon: BarChart3,
          },
          {
            label: "Archived insights",
            value: archives.length,
            icon: Archive,
          },
          {
            label: "Current period",
            value: period === "MONTHLY" ? "Monthly" : "Weekly",
            icon: CalendarDays,
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

      {sections.map((section) => {
        const sectionInsights = insights.filter(
          (insight) => insight.category === section.key
        );

        return (
          <section
            key={section.key}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <section.icon size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {section.description}
                </p>
              </div>
            </div>

            {sectionInsights.length === 0 ? (
              <EmptyState
                icon={section.icon}
                title="No insight data yet"
                description="As real messages, orders, and campaigns come in, this section will show stronger recommendations."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {sectionInsights.map((insight) => (
                  <InsightCard
                    key={`${insight.category}-${insight.title}`}
                    insight={insight}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">Insight archive</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Manual regenerations are saved here as dated snapshots.
        </p>

        <div className="mt-5 space-y-3">
          {archives.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No archived insights yet"
              description="Use regenerate insights to save the current recommendations as an archive snapshot."
            />
          ) : (
            archives.map((archive) => (
              <div
                key={archive.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {archive.title}
                      </h3>
                      <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                        {archive.period}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${priorityClass(
                          archive.priority
                        )}`}
                      >
                        {archive.priority}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
                      {archive.summary}
                    </p>
                  </div>

                  <div className="shrink-0 text-left md:text-right">
                    <p className="text-xs text-zinc-500">
                      {archive.createdAt.toLocaleDateString()}
                    </p>
                    {archive.metricLabel && (
                      <p className="mt-2 text-xs text-emerald-300">
                        {archive.metricLabel}: {archive.metricValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
