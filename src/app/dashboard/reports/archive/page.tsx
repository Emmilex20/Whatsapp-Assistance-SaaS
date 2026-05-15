import Link from "next/link";
import {
  Archive,
  CalendarDays,
  MessageSquareText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export default async function ReportArchivePage() {
  await requirePermission("manage_reports");

  const restaurant = await getOrCreateCurrentRestaurant();

  const archives = restaurant
    ? await prisma.reportArchive.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Report archive
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Saved reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Keep weekly and monthly report snapshots for future review, client
          updates, and business records.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Archived reports",
            value: archives.length,
            icon: Archive,
          },
          {
            label: "Total messages",
            value: archives.reduce((sum, item) => sum + item.messages, 0),
            icon: MessageSquareText,
          },
          {
            label: "Total orders",
            value: archives.reduce((sum, item) => sum + item.orders, 0),
            icon: ShoppingBag,
          },
          {
            label: "Total revenue",
            value: `₦${archives
              .reduce((sum, item) => sum + item.revenue, 0)
              .toLocaleString()}`,
            icon: Wallet,
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

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">Report history</h2>

        <div className="mt-5 space-y-3">
          {archives.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No archived reports yet"
              description="Open a weekly or monthly operations report and save a snapshot here for future client updates."
              actionLabel="Open operations"
              actionHref="/dashboard/operations"
            />
          ) : (
            archives.map((archive) => (
              <Link
                key={archive.id}
                href={`/dashboard/reports/archive/${archive.id}`}
                className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Archive size={15} className="text-emerald-400" />

                      <h3 className="text-sm font-semibold text-white">
                        {archive.title}
                      </h3>

                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                        {archive.type}
                      </span>
                    </div>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                      <CalendarDays size={13} />
                      {archive.periodStart.toLocaleDateString()} to{" "}
                      {archive.periodEnd.toLocaleDateString()}
                    </p>

                    {archive.summaryNote && (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {archive.summaryNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                      {archive.messages} messages
                    </span>

                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                      {archive.orders} orders
                    </span>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      ₦{archive.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
