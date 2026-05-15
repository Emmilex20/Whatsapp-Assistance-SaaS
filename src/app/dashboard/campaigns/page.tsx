import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { updatePromoCampaignStatus } from "@/actions/campaigns";
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";
import { CreateRecommendedCampaignsButton } from "@/components/campaigns/create-recommended-campaigns-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PromoCampaignStatus } from "@/generated/prisma/client";
import { getCampaignPostReminders } from "@/lib/campaign-reminders";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

const statusStyles: Record<PromoCampaignStatus, string> = {
  DRAFT: "bg-zinc-400/10 text-zinc-300",
  SCHEDULED: "bg-blue-400/10 text-blue-300",
  ACTIVE: "bg-emerald-400/10 text-emerald-300",
  COMPLETED: "bg-purple-400/10 text-purple-300",
  CANCELLED: "bg-red-400/10 text-red-300",
};

const statusActions: PromoCampaignStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

export default async function CampaignsPage() {
  await requirePermission("manage_campaigns");

  const restaurant = await getOrCreateCurrentRestaurant();

  const campaigns = restaurant
    ? await prisma.promoCampaign.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        include: {
          media: true,
        },
      })
    : [];
  const reminders = restaurant
    ? await getCampaignPostReminders(restaurant.id)
    : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Promo campaigns
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Campaign builder
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Group promo images, captions, and marketing ideas into campaigns for
            restaurants.
          </p>
        </div>

        <div className="action-row">
          <CreateRecommendedCampaignsButton />
          <Link
            href="/dashboard/campaigns/calendar"
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            Posting calendar
          </Link>
        </div>
      </section>

      {reminders && (
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Overdue posts",
              value: reminders.overdue.length,
            },
            {
              label: "Due today",
              value: reminders.dueToday.length,
            },
            {
              label: "Upcoming posts",
              value: reminders.upcoming.length,
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

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <CreateCampaignForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Campaigns</h2>

          <div className="mt-5 space-y-3">
            {campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="Create your first promo campaign to organize images, captions, posting dates, and performance tracking."
              />
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Megaphone size={15} className="text-emerald-400" />

                        <h3 className="text-sm font-semibold text-white">
                          {campaign.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${statusStyles[campaign.status]}`}
                        >
                          {campaign.status}
                        </span>

                        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {campaign.media.length} assets
                        </span>
                      </div>

                      {campaign.goal && (
                        <p className="mt-2 text-sm text-zinc-400">
                          Goal: {campaign.goal}
                        </p>
                      )}

                      {campaign.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {campaign.description}
                        </p>
                      )}

                      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
                        <CalendarDays size={13} />
                        {campaign.startDate
                          ? campaign.startDate.toLocaleDateString()
                          : "No start date"}{" "}
                        to{" "}
                        {campaign.endDate
                          ? campaign.endDate.toLocaleDateString()
                          : "No end date"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {campaign.whatsappInquiries} inquiries
                        </span>

                        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {campaign.ordersGenerated} orders
                        </span>

                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                          ₦{campaign.revenueGenerated.toLocaleString()} revenue
                        </span>
                      </div>
                    </div>

                    <div className="action-row">
                      {statusActions.map((status) => (
                        <form
                          key={status}
                          action={async (formData) => {
                            "use server";

                            await updatePromoCampaignStatus(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={campaign.id} />
                          <input type="hidden" name="status" value={status} />

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                          >
                            {status.toLowerCase()}
                          </Button>
                        </form>
                      ))}

                      <Link href={`/dashboard/campaigns/${campaign.id}`}>
                        <Button className="h-8 rounded-full bg-emerald-500 px-3 text-xs text-white hover:bg-emerald-400">
                          View
                          <ArrowRight className="ml-1.5" size={13} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
