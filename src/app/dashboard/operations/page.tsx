import Link from "next/link";
import {
  CalendarDays,
  MessageSquareText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getDailyOperationsSummary } from "@/lib/daily-operations";

export default async function OperationsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const summary = restaurant
    ? await getDailyOperationsSummary(restaurant.id)
    : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Daily operations
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Today activity summary
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Review chats, orders, revenue, and campaign posting activity for
            today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/operations/weekly"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            View weekly report
          </Link>

          <Link
            href="/dashboard/operations/monthly"
            className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
          >
            View monthly report
          </Link>
        </div>
      </section>

      {summary && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {[
              {
                label: "Messages today",
                value: summary.messages,
                icon: MessageSquareText,
              },
              {
                label: "Orders today",
                value: summary.orders,
                icon: ShoppingBag,
              },
              {
                label: "Revenue today",
                value: `₦${summary.revenue.toLocaleString()}`,
                icon: Wallet,
              },
              {
                label: "Posts completed",
                value: summary.postedCampaignPosts.length,
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

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-white">
                Campaign posts completed today
              </h2>

              <div className="mt-5 space-y-3">
                {summary.postedCampaignPosts.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                    No campaign posts marked posted today.
                  </p>
                ) : (
                  summary.postedCampaignPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {post.platform} · {post.campaign.title}
                      </p>
                      {post.completionNotes && (
                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                          {post.completionNotes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
              <h2 className="text-base font-semibold text-white">
                Overdue campaign posts
              </h2>

              <div className="mt-5 space-y-3">
                {summary.overdueCampaignPosts.length === 0 ? (
                  <p className="rounded-2xl border border-red-400/20 bg-zinc-950/40 p-5 text-sm text-red-100">
                    No overdue campaign posts.
                  </p>
                ) : (
                  summary.overdueCampaignPosts.map((post) => (
                    <Link
                      key={post.id}
                      href="/dashboard/campaigns/calendar"
                      className="block rounded-2xl border border-red-400/20 bg-zinc-950/40 p-4 transition hover:bg-zinc-900"
                    >
                      <p className="text-sm font-semibold text-white">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-red-100">
                        {post.platform} · {post.scheduledAt.toLocaleString()}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
