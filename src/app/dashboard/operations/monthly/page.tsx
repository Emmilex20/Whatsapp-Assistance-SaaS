import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  ImageIcon,
  MessageSquareText,
  Printer,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { CopyTextButton } from "@/components/shared/copy-text-button";
import { SaveReportArchiveButton } from "@/components/reports/save-report-archive-button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getMonthlyOperationsReport } from "@/lib/monthly-operations";
import { buildReportSharingNotes } from "@/lib/report-summary";

export default async function MonthlyOperationsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const report = restaurant
    ? await getMonthlyOperationsReport(restaurant.id)
    : null;

  const sharingNotes =
    restaurant && report
      ? buildReportSharingNotes({
          restaurantName: restaurant.name,
          periodLabel: "monthly",
          messages: report.messages,
          orders: report.orders,
          revenue: report.revenue,
          campaignPosts: report.campaignPosts.length,
          missedPosts: report.missedPosts.length,
          aiEvents: report.ai.events,
          mediaAssets: report.media.generations,
        })
      : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/dashboard/operations"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to operations
          </Link>

          <p className="text-sm font-medium text-emerald-400">
            Monthly report
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Monthly operations summary
          </h1>

          {report && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {report.start.toLocaleDateString()} to{" "}
              {report.end.toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <SaveReportArchiveButton type="MONTHLY" />

          <Link
            href="/dashboard/operations/monthly/print"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Printer className="mr-2" size={16} />
            Print / Export PDF
          </Link>
        </div>
      </section>

      {report && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              {
                label: "Messages",
                value: report.messages,
                icon: MessageSquareText,
              },
              {
                label: "Orders",
                value: report.orders,
                icon: ShoppingBag,
              },
              {
                label: "Revenue",
                value: `₦${report.revenue.toLocaleString()}`,
                icon: Wallet,
              },
              {
                label: "Campaign posts",
                value: report.campaignPosts.length,
                icon: CalendarDays,
              },
              {
                label: "AI events",
                value: report.ai.events,
                icon: Bot,
              },
              {
                label: "Media assets",
                value: report.media.generations,
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

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {item.value}
                </h2>
              </div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-white">
                Monthly campaign posts
              </h2>

              <div className="mt-5 space-y-3">
                {report.campaignPosts.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                    No campaign posts scheduled this month.
                  </p>
                ) : (
                  report.campaignPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {post.platform} ·{" "}
                            {post.scheduledAt.toLocaleString()}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            {post.campaign.title}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            post.posted
                              ? "bg-emerald-400/10 text-emerald-300"
                              : post.scheduledAt < new Date()
                                ? "bg-red-400/10 text-red-300"
                                : "bg-yellow-400/10 text-yellow-300"
                          }`}
                        >
                          {post.posted
                            ? "Posted"
                            : post.scheduledAt < new Date()
                              ? "Missed"
                              : "Upcoming"}
                        </span>
                      </div>

                      {post.completionNotes && (
                        <p className="mt-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-3 text-sm leading-6 text-zinc-400">
                          {post.completionNotes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-base font-semibold text-white">
                  Top campaigns
                </h2>

                <div className="mt-5 space-y-3">
                  {report.topCampaigns.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                      No campaign performance recorded yet.
                    </p>
                  ) : (
                    report.topCampaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                      >
                        <p className="text-sm font-semibold text-white">
                          {campaign.title}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                            ₦{campaign.revenueGenerated.toLocaleString()}
                          </span>

                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                            {campaign.ordersGenerated} orders
                          </span>

                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                            {campaign.whatsappInquiries} inquiries
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
                <h2 className="text-base font-semibold text-white">
                  AI + media cost summary
                </h2>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                    <p className="text-sm text-blue-100">AI usage</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {report.ai.events} events
                    </h3>
                    <p className="mt-1 text-xs text-blue-100">
                      {report.ai.tokens.toLocaleString()} tokens · $
                      {report.ai.cost.toFixed(4)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                    <p className="text-sm text-blue-100">Media usage</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {report.media.generations} assets
                    </h3>
                    <p className="mt-1 text-xs text-blue-100">
                      ${report.media.cost.toFixed(4)} estimated cost
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {sharingNotes && (
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-white">
                Sharing notes
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Copy a short report summary for the restaurant owner or client.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    WhatsApp summary
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                    {sharingNotes.whatsapp}
                  </p>

                  <div className="mt-4">
                    <CopyTextButton
                      value={sharingNotes.whatsapp}
                      label="Copy WhatsApp summary"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Email summary
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                    {sharingNotes.email}
                  </p>

                  <div className="mt-4">
                    <CopyTextButton
                      value={sharingNotes.email}
                      label="Copy email summary"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Monthly insight
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              This month had {report.messages} messages, {report.orders} orders,
              and ₦{report.revenue.toLocaleString()} in revenue.{" "}
              {report.missedPosts.length > 0
                ? `${report.missedPosts.length} campaign post(s) were missed.`
                : "No missed campaign posts were detected."}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
