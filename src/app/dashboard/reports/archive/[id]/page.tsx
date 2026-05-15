import Link from "next/link";
import { notFound } from "next/navigation";
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
import { DeleteReportArchiveButton } from "@/components/reports/delete-report-archive-button";
import { CopyTextButton } from "@/components/shared/copy-text-button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { buildReportSharingNotes } from "@/lib/report-summary";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportArchiveDetailPage({ params }: PageProps) {
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
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/reports/archive"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to archive
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Archived report
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {archive.title}
        </h1>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
          <CalendarDays size={15} />
          {archive.periodStart.toLocaleDateString()} to{" "}
          {archive.periodEnd.toLocaleDateString()}
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard/reports/archive/${archive.id}/print`}
          className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <Printer className="mr-2" size={16} />
          Print / Export PDF
        </Link>

        <DeleteReportArchiveButton id={archive.id} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          {
            label: "Messages",
            value: archive.messages,
            icon: MessageSquareText,
          },
          { label: "Orders", value: archive.orders, icon: ShoppingBag },
          {
            label: "Revenue",
            value: `₦${archive.revenue.toLocaleString()}`,
            icon: Wallet,
          },
          {
            label: "Campaign posts",
            value: archive.campaignPosts,
            icon: CalendarDays,
          },
          { label: "AI events", value: archive.aiEvents, icon: Bot },
          { label: "Media assets", value: archive.mediaAssets, icon: ImageIcon },
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

      {archive.summaryNote && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h2 className="text-base font-semibold text-white">Summary note</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {archive.summaryNote}
          </p>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">Sharing notes</h2>

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
                label="Copy WhatsApp"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="text-sm font-semibold text-white">Email summary</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
              {sharingNotes.email}
            </p>
            <div className="mt-4">
              <CopyTextButton value={sharingNotes.email} label="Copy Email" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
