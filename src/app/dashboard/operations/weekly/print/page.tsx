import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/shared/print-button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { buildReportSharingNotes } from "@/lib/report-summary";
import { getWeeklyOperationsReport } from "@/lib/weekly-operations";

export default async function PrintableWeeklyReportPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const report = restaurant
    ? await getWeeklyOperationsReport(restaurant.id)
    : null;

  if (!restaurant || !report) {
    return null;
  }

  const sharingNotes = buildReportSharingNotes({
    restaurantName: restaurant.name,
    periodLabel: "weekly",
    messages: report.messages,
    orders: report.orders,
    revenue: report.revenue,
    campaignPosts: report.campaignPosts.length,
    missedPosts: report.missedPosts.length,
  });

  return (
    <main className="min-h-screen bg-white p-6 text-zinc-950 print:p-0">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white p-8 print:rounded-none print:p-6">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard/operations/weekly"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft size={16} />
            Back to weekly report
          </Link>

          <PrintButton />
        </div>

        <section className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">
            Weekly Operations Report
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {restaurant.name}
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            {report.start.toLocaleDateString()} to{" "}
            {report.end.toLocaleDateString()}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Messages", value: report.messages },
            { label: "Orders", value: report.orders },
            { label: "Revenue", value: `₦${report.revenue.toLocaleString()}` },
            { label: "Posts completed", value: report.postedPosts.length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-200 p-4"
            >
              <p className="text-sm text-zinc-500">{item.label}</p>
              <h2 className="mt-2 text-2xl font-bold">{item.value}</h2>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-bold">Campaign posts this week</h2>

          <div className="mt-4 space-y-3">
            {report.campaignPosts.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600">
                No campaign posts scheduled this week.
              </p>
            ) : (
              report.campaignPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">{post.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {post.platform} · {post.scheduledAt.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Campaign: {post.campaign.title}
                      </p>
                    </div>

                    <span className="text-sm font-medium">
                      {post.posted
                        ? "Posted"
                        : post.scheduledAt < new Date()
                          ? "Missed"
                          : "Upcoming"}
                    </span>
                  </div>

                  {post.completionNotes && (
                    <p className="mt-3 rounded-xl bg-zinc-100 p-3 text-sm text-zinc-700">
                      {post.completionNotes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">Top campaigns</h2>

          <div className="mt-4 space-y-3">
            {report.topCampaigns.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600">
                No campaign performance recorded yet.
              </p>
            ) : (
              report.topCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <p className="font-semibold">{campaign.title}</p>

                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-600">
                    <span>
                      Revenue: ₦{campaign.revenueGenerated.toLocaleString()}
                    </span>
                    <span>Orders: {campaign.ordersGenerated}</span>
                    <span>Inquiries: {campaign.whatsappInquiries}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">Client sharing note</h2>
          <p className="mt-3 whitespace-pre-line rounded-2xl border border-zinc-200 p-4 text-sm leading-6 text-zinc-700">
            {sharingNotes.whatsapp}
          </p>
        </section>

        <section className="rounded-2xl bg-emerald-50 p-5">
          <h2 className="text-lg font-bold">Weekly insight</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-700">
            This week had {report.messages} messages, {report.orders} orders,
            and ₦{report.revenue.toLocaleString()} in revenue.{" "}
            {report.missedPosts.length > 0
              ? `${report.missedPosts.length} campaign post(s) were missed.`
              : "No missed campaign posts were detected."}
          </p>
        </section>
      </div>
    </main>
  );
}
