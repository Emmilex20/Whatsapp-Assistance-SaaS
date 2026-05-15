import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { detachMediaFromCampaign } from "@/actions/campaigns";
import { CampaignPerformanceForm } from "@/components/campaigns/campaign-performance-form";
import { CampaignPostAssignmentForm } from "@/components/campaigns/campaign-post-assignment-form";
import { DeleteCampaignPostButton } from "@/components/campaigns/delete-campaign-post-button";
import { EditCampaignPostForm } from "@/components/campaigns/edit-campaign-post-form";
import { GenerateCaptionPackButton } from "@/components/campaigns/generate-caption-pack-button";
import { CopyTextButton } from "@/components/shared/copy-text-button";
import { Button } from "@/components/ui/button";
import { buildCampaignReminderDraft } from "@/lib/campaign-reminder-drafts";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  await requirePermission("manage_campaigns");

  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const campaign = restaurant
    ? await prisma.promoCampaign.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
        include: {
          media: {
            orderBy: { createdAt: "desc" },
          },
          captionPacks: {
            orderBy: { createdAt: "desc" },
          },
          posts: {
            orderBy: { scheduledAt: "asc" },
            include: {
              assignedTeamMember: true,
            },
          },
        },
      })
    : null;
  const teamMembers = restaurant
    ? await prisma.teamMember.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    : [];

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/campaigns"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Campaign detail
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {campaign.title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          {campaign.description || "No description added."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Status", value: campaign.status },
          { label: "Goal", value: campaign.goal || "Not set" },
          {
            label: "Start",
            value: campaign.startDate
              ? campaign.startDate.toLocaleDateString()
              : "Not set",
          },
          {
            label: "End",
            value: campaign.endDate
              ? campaign.endDate.toLocaleDateString()
              : "Not set",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Impressions",
            value: campaign.impressions.toLocaleString(),
          },
          {
            label: "WhatsApp inquiries",
            value: campaign.whatsappInquiries.toLocaleString(),
          },
          {
            label: "Orders",
            value: campaign.ordersGenerated.toLocaleString(),
          },
          {
            label: "Revenue",
            value: `₦${campaign.revenueGenerated.toLocaleString()}`,
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

      {campaign.revenueGenerated > 0 && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            Campaign result insight
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            This campaign generated ₦
            {campaign.revenueGenerated.toLocaleString()} from{" "}
            {campaign.ordersGenerated.toLocaleString()} order
            {campaign.ordersGenerated === 1 ? "" : "s"}. Average order value is
            ₦
            {campaign.ordersGenerated
              ? Math.round(
                  campaign.revenueGenerated / campaign.ordersGenerated
                ).toLocaleString()
              : "0"}
            .
          </p>
        </section>
      )}

      <CampaignPerformanceForm
        campaign={{
          id: campaign.id,
          impressions: campaign.impressions,
          whatsappInquiries: campaign.whatsappInquiries,
          ordersGenerated: campaign.ordersGenerated,
          revenueGenerated: campaign.revenueGenerated,
          performanceNotes: campaign.performanceNotes,
        }}
      />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Posting schedule
        </h2>

        <div className="mt-5 space-y-3">
          {campaign.posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No posts scheduled for this campaign yet.
            </div>
          ) : (
            campaign.posts.map((post) => {
              const drafts = buildCampaignReminderDraft({
                ...post,
                campaign: {
                  title: campaign.title,
                },
              });
              const isOverdue = !post.posted && post.scheduledAt < new Date();
              const isDueToday =
                !post.posted &&
                post.scheduledAt.toDateString() === new Date().toDateString();

              return (
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
                        {post.platform} · {post.scheduledAt.toLocaleString()}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                        {post.assignedTeamMember
                          ? `Assigned: ${
                              post.assignedTeamMember.name ||
                              post.assignedTeamMember.email
                            }`
                          : "Unassigned"}
                      </span>
                    </div>

                    <div className="action-row">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          post.posted
                            ? "bg-emerald-400/10 text-emerald-300"
                            : isOverdue
                              ? "bg-red-400/10 text-red-300"
                              : isDueToday
                                ? "bg-yellow-400/10 text-yellow-300"
                                : "bg-blue-400/10 text-blue-300"
                        }`}
                      >
                        {post.posted
                          ? "Posted"
                          : isOverdue
                            ? "Overdue"
                            : isDueToday
                              ? "Due today"
                              : "Upcoming"}
                      </span>
                      <CopyTextButton
                        value={drafts.whatsapp}
                        label="Copy WhatsApp reminder"
                      />
                      <CopyTextButton
                        value={drafts.email}
                        label="Copy email reminder"
                      />
                      <DeleteCampaignPostButton id={post.id} />
                    </div>
                  </div>

                  <CampaignPostAssignmentForm
                    postId={post.id}
                    assignedTeamMemberId={post.assignedTeamMemberId}
                    teamMembers={teamMembers}
                  />

                  <EditCampaignPostForm
                    post={{
                      id: post.id,
                      title: post.title,
                      platform: post.platform,
                      scheduledAt: post.scheduledAt,
                      notes: post.notes,
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        <Link
          href="/dashboard/campaigns/calendar"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
        >
          Open posting calendar
        </Link>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Campaign caption pack
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Generate WhatsApp Status, Instagram, Facebook captions, and
              hashtags for this campaign.
            </p>
          </div>

          <GenerateCaptionPackButton campaignId={campaign.id} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">Caption packs</h2>

        <div className="mt-5 space-y-4">
          {campaign.captionPacks.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No caption packs generated yet.
            </div>
          ) : (
            campaign.captionPacks.map((pack) => {
              const hashtags = pack.hashtags.join(" ");
              const fullInstagram = `${pack.instagramPost || ""}\n\n${hashtags}`.trim();

              return (
                <div
                  key={pack.id}
                  className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5"
                >
                  <p className="mb-4 text-xs text-zinc-500">
                    Generated {pack.createdAt.toLocaleString()}
                  </p>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                      <h3 className="text-sm font-semibold text-white">
                        WhatsApp Status
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                        {pack.whatsappStatus || "No WhatsApp copy generated."}
                      </p>
                      <div className="mt-4">
                        <CopyTextButton
                          value={pack.whatsappStatus || ""}
                          label="Copy WhatsApp"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                      <h3 className="text-sm font-semibold text-white">
                        Instagram
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                        {fullInstagram || "No Instagram copy generated."}
                      </p>
                      <div className="mt-4">
                        <CopyTextButton
                          value={fullInstagram}
                          label="Copy Instagram"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                      <h3 className="text-sm font-semibold text-white">
                        Facebook
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                        {pack.facebookPost || "No Facebook copy generated."}
                      </p>
                      <div className="mt-4">
                        <CopyTextButton
                          value={pack.facebookPost || ""}
                          label="Copy Facebook"
                        />
                      </div>
                    </div>
                  </div>

                  {pack.hashtags.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                      <h3 className="text-sm font-semibold text-white">
                        Hashtags
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {hashtags}
                      </p>
                      <div className="mt-4">
                        <CopyTextButton value={hashtags} label="Copy hashtags" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <ImageIcon size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Campaign assets
            </h2>
            <p className="text-sm text-zinc-500">
              Promo images and captions linked to this campaign.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaign.media.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400 md:col-span-2 xl:col-span-3">
              No media assets attached yet. Attach media from the Media page.
            </div>
          ) : (
            campaign.media.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70"
              >
                {item.outputUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.outputUrl}
                    alt="Campaign media"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-zinc-950 text-sm text-zinc-500">
                    No image
                  </div>
                )}

                <div className="space-y-3 p-4">
                  {item.caption ? (
                    <p className="text-sm leading-6 text-zinc-300">
                      {item.caption}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No caption generated yet.
                    </p>
                  )}

                  <form
                    action={async (formData) => {
                      "use server";

                      await detachMediaFromCampaign(formData);
                    }}
                  >
                    <input type="hidden" name="mediaId" value={item.id} />
                    <input
                      type="hidden"
                      name="campaignId"
                      value={campaign.id}
                    />

                    <Button
                      variant="outline"
                      className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-4 text-xs text-red-300 hover:bg-red-400/20"
                    >
                      Remove from campaign
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Posting checklist
        </h2>

        <div className="mt-5 space-y-3">
          {[
            "Choose the best campaign image from assets.",
            "Copy WhatsApp Status caption and post image to status.",
            "Copy Instagram caption with hashtags and post image.",
            "Copy Facebook caption and post to page/profile.",
            "Reply quickly to customers who ask questions from the promo.",
            "Track whether promo increases WhatsApp messages and orders.",
            "Mark campaign as completed after the promo period ends.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-blue-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
