import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  Megaphone,
  Share2,
} from "lucide-react";
import { CampaignPostAssignmentForm } from "@/components/campaigns/campaign-post-assignment-form";
import { CreateCampaignPostForm } from "@/components/campaigns/create-campaign-post-form";
import { CreateSocialAccountForm } from "@/components/campaigns/create-social-account-form";
import { DeleteCampaignPostButton } from "@/components/campaigns/delete-campaign-post-button";
import { EditCampaignPostForm } from "@/components/campaigns/edit-campaign-post-form";
import { ToggleAutoPostButton } from "@/components/campaigns/toggle-auto-post-button";
import { TogglePostedButton } from "@/components/campaigns/toggle-posted-button";
import { ToggleSocialAccountButton } from "@/components/campaigns/toggle-social-account-button";
import { CopyTextButton } from "@/components/shared/copy-text-button";
import { buildCampaignReminderDraft } from "@/lib/campaign-reminder-drafts";
import { getCampaignPostReminders } from "@/lib/campaign-reminders";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";
import { getSocialPlatformLabel } from "@/lib/social-platforms";

type CalendarPageProps = {
  searchParams: Promise<{
    assigned?: string;
  }>;
};

export default async function CampaignCalendarPage({
  searchParams,
}: CalendarPageProps) {
  await requirePermission("manage_campaigns");

  const params = await searchParams;
  const assignedFilter = params.assigned || "all";
  const restaurant = await getOrCreateCurrentRestaurant();

  const campaigns = restaurant
    ? await prisma.promoCampaign.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true },
      })
    : [];

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

  const socialAccounts = restaurant
    ? await prisma.socialAccount.findMany({
        where: {
          restaurantId: restaurant.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          provider: true,
          displayName: true,
          accountHandle: true,
          postingEnabled: true,
          paused: true,
          status: true,
        },
      })
    : [];

  const posts = restaurant
    ? await prisma.campaignPost.findMany({
        where: {
          campaign: {
            restaurantId: restaurant.id,
          },
          ...(assignedFilter === "unassigned"
            ? { assignedTeamMemberId: null }
            : assignedFilter !== "all"
              ? { assignedTeamMemberId: assignedFilter }
              : {}),
        },
        orderBy: { scheduledAt: "asc" },
        include: {
          campaign: true,
          assignedTeamMember: true,
          socialAccount: true,
        },
      })
    : [];

  const upcoming = posts.filter((post) => !post.posted);
  const posted = posts.filter((post) => post.posted);
  const reminders = restaurant
    ? await getCampaignPostReminders(restaurant.id)
    : null;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Posting calendar
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Campaign posting schedule
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Plan and track when campaign content should be posted to WhatsApp,
          Instagram, Facebook, and other channels.
        </p>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Reminder drafts
        </h2>

        <p className="mt-2 text-sm leading-6 text-blue-100">
          Each scheduled post now has copy-ready reminder messages. Use them to
          remind yourself or staff what to post, where to post it, and when.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <Share2 size={18} className="mt-1 text-emerald-300" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Social auto-posting
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Connect approved channels, choose them on scheduled posts, then
              pause or resume auto-posting per account or per post. WhatsApp
              Status remains manual-only because normal Cloud API status
              publishing is not available.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Scheduled posts", value: posts.length },
          { label: "Upcoming", value: upcoming.length },
          { label: "Posted", value: posted.length },
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

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
          Filter by assignee
        </p>

        <div className="action-row">
          <Link
            href="/dashboard/campaigns/calendar"
            className={`rounded-full px-4 py-2 text-sm transition ${
              assignedFilter === "all"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            All posts
          </Link>

          <Link
            href="/dashboard/campaigns/calendar?assigned=unassigned"
            className={`rounded-full px-4 py-2 text-sm transition ${
              assignedFilter === "unassigned"
                ? "bg-emerald-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Unassigned
          </Link>

          {teamMembers.map((member) => (
            <Link
              key={member.id}
              href={`/dashboard/campaigns/calendar?assigned=${member.id}`}
              className={`rounded-full px-4 py-2 text-sm transition ${
                assignedFilter === member.id
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {member.name || member.email}
            </Link>
          ))}
        </div>
      </section>

      {reminders && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-300" />
              <h2 className="text-base font-semibold text-white">
                Overdue posts
              </h2>
            </div>

            <div className="space-y-3">
              {reminders.overdue.length === 0 ? (
                <p className="rounded-2xl border border-red-400/20 bg-zinc-950/40 p-4 text-sm text-red-100">
                  No overdue posts.
                </p>
              ) : (
                reminders.overdue.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-red-400/20 bg-zinc-950/40 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-red-100">
                      {post.platform} · {post.scheduledAt.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {post.campaign.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <BellRing size={18} className="text-yellow-100" />
              <h2 className="text-base font-semibold text-white">Due today</h2>
            </div>

            <div className="space-y-3">
              {reminders.dueToday.length === 0 ? (
                <p className="rounded-2xl border border-yellow-400/20 bg-zinc-950/40 p-4 text-sm text-yellow-100">
                  No posts due today.
                </p>
              ) : (
                reminders.dueToday.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-yellow-400/20 bg-zinc-950/40 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-yellow-100">
                      {post.platform} · {post.scheduledAt.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {post.campaign.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <CreateCampaignPostForm
            campaigns={campaigns}
            teamMembers={teamMembers}
            socialAccounts={socialAccounts}
          />

          <CreateSocialAccountForm />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Upcoming posts
          </h2>

          <div className="mt-5 space-y-3">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No upcoming posts scheduled.
              </div>
            ) : (
              upcoming.map((post) => {
                const drafts = buildCampaignReminderDraft(post);

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="text-emerald-400"
                          />
                          <h3 className="text-sm font-semibold text-white">
                            {post.title}
                          </h3>
                          <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                            {post.platform}
                          </span>
                          <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                            {post.assignedTeamMember
                              ? `Assigned: ${
                                  post.assignedTeamMember.name ||
                                  post.assignedTeamMember.email
                                }`
                              : "Unassigned"}
                          </span>
                          {post.socialAccount && (
                            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                              Auto: {post.socialAccount.displayName}
                            </span>
                          )}
                          {post.autoPostEnabled && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                post.autoPostPaused
                                  ? "bg-yellow-400/10 text-yellow-300"
                                  : post.autoPostStatus === "FAILED"
                                    ? "bg-red-400/10 text-red-300"
                                    : "bg-blue-400/10 text-blue-300"
                              }`}
                            >
                              {post.autoPostPaused
                                ? "Auto paused"
                                : post.autoPostStatus}
                            </span>
                          )}
                          {post.scheduledAt < new Date() && (
                            <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300">
                              Overdue
                            </span>
                          )}
                          {post.scheduledAt.toDateString() ===
                            new Date().toDateString() && (
                            <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                              Due today
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                          {post.scheduledAt.toLocaleString()}
                        </p>

                        <Link
                          href={`/dashboard/campaigns/${post.campaignId}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <Megaphone size={13} />
                          {post.campaign.title}
                        </Link>

                        {post.notes && (
                          <p className="mt-3 text-sm leading-6 text-zinc-500">
                            {post.notes}
                          </p>
                        )}
                      </div>

                      <div className="action-row">
                        <TogglePostedButton id={post.id} posted={post.posted} />
                        {post.autoPostEnabled && (
                          <ToggleAutoPostButton
                            id={post.id}
                            paused={post.autoPostPaused}
                          />
                        )}
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
                        socialAccountId: post.socialAccountId,
                        autoPostEnabled: post.autoPostEnabled,
                      }}
                      socialAccounts={socialAccounts}
                    />
                    {post.autoPostError && (
                      <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
                        Auto-post error: {post.autoPostError}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">Posted history</h2>

        <div className="mt-5 space-y-3">
          {posted.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No posts marked as posted yet.
            </div>
          ) : (
            posted.map((post) => {
              const drafts = buildCampaignReminderDraft(post);

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
                      <TogglePostedButton id={post.id} posted={post.posted} />
                      {post.autoPostEnabled && (
                        <ToggleAutoPostButton
                          id={post.id}
                          paused={post.autoPostPaused}
                        />
                      )}
                      <CopyTextButton
                        value={drafts.whatsapp}
                        label="Copy reminder"
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
                      socialAccountId: post.socialAccountId,
                      autoPostEnabled: post.autoPostEnabled,
                    }}
                    socialAccounts={socialAccounts}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Connected social channels
        </h2>

        <div className="mt-5 space-y-3">
          {socialAccounts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No social channels saved yet. Add a channel permission before
              enabling automatic campaign publishing.
            </div>
          ) : (
            socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {account.displayName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {getSocialPlatformLabel(account.provider)}
                    {account.accountHandle ? ` - ${account.accountHandle}` : ""}
                  </p>
                </div>

                <div className="action-row">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      account.postingEnabled && !account.paused
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-yellow-400/10 text-yellow-300"
                    }`}
                  >
                    {account.postingEnabled
                      ? account.paused
                        ? "Paused"
                        : "Posting enabled"
                      : "Manual only"}
                  </span>
                  {account.postingEnabled && (
                    <ToggleSocialAccountButton
                      id={account.id}
                      paused={account.paused}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
