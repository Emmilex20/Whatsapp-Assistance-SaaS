import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/shared/print-button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { buildReportSharingNotes } from "@/lib/report-summary";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintableArchivedReportPage({
  params,
}: PageProps) {
  await requirePermission("manage_reports");

  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const archive = restaurant
    ? await prisma.reportArchive.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
      })
    : null;

  if (!restaurant || !archive) notFound();

  const sharingNotes = buildReportSharingNotes({
    restaurantName: restaurant.name,
    periodLabel: archive.type.toLowerCase(),
    messages: archive.messages,
    orders: archive.orders,
    revenue: archive.revenue,
    campaignPosts: archive.campaignPosts,
    missedPosts: archive.missedPosts,
    aiEvents: archive.aiEvents,
    mediaAssets: archive.mediaAssets,
  });

  return (
    <main className="min-h-screen bg-white p-6 text-zinc-950 print:p-0">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-white p-8 print:rounded-none print:p-6">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href={`/dashboard/reports/archive/${archive.id}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft size={16} />
            Back to archive detail
          </Link>

          <PrintButton />
        </div>

        <section className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">
            Archived {archive.type.toLowerCase()} Report
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {restaurant.name}
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            {archive.periodStart.toLocaleDateString()} to{" "}
            {archive.periodEnd.toLocaleDateString()}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Messages", value: archive.messages },
            { label: "Orders", value: archive.orders },
            { label: "Revenue", value: `₦${archive.revenue.toLocaleString()}` },
            { label: "Campaign posts", value: archive.campaignPosts },
            { label: "Missed posts", value: archive.missedPosts },
            { label: "AI events", value: archive.aiEvents },
            { label: "Media assets", value: archive.mediaAssets },
            { label: "Saved", value: archive.createdAt.toLocaleDateString() },
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

        {archive.summaryNote && (
          <section className="rounded-2xl bg-emerald-50 p-5">
            <h2 className="text-lg font-bold">Summary note</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              {archive.summaryNote}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold">Client sharing note</h2>
          <p className="mt-3 whitespace-pre-line rounded-2xl border border-zinc-200 p-4 text-sm leading-6 text-zinc-700">
            {sharingNotes.whatsapp}
          </p>
        </section>
      </div>
    </main>
  );
}
