import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TasksFilterBar } from "@/components/tasks/tasks-filter-bar";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { getStaffTasks } from "@/lib/staff-tasks";

type TasksPageProps = {
  searchParams: Promise<{
    staff?: string;
    type?: string;
    urgency?: string;
  }>;
};

export default async function StaffTasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const staffFilter = params.staff || "all";
  const typeFilter = params.type || "all";
  const urgencyFilter = params.urgency || "all";
  const restaurant = await getOrCreateCurrentRestaurant();

  const staffTasks = restaurant ? await getStaffTasks(restaurant.id) : [];
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
  const visibleStaffTasks = staffTasks
    .filter((staff) => {
      if (staffFilter === "all") return true;

      return staff.id === staffFilter;
    })
    .map((staff) => {
      const conversations =
        typeFilter === "all" || typeFilter === "chats"
          ? staff.conversations
          : [];

      const orders =
        typeFilter === "all" || typeFilter === "orders" ? staff.orders : [];

      let campaignPosts =
        typeFilter === "all" || typeFilter === "posts"
          ? staff.campaignPosts
          : [];

      if (urgencyFilter === "overdue") {
        campaignPosts = staff.overduePosts;
      }

      if (urgencyFilter === "due_today") {
        campaignPosts = staff.dueTodayPosts;
      }

      return {
        ...staff,
        conversations,
        orders,
        campaignPosts,
        totals: {
          conversations: conversations.length,
          orders: orders.length,
          campaignPosts: campaignPosts.length,
          overduePosts: staff.overduePosts.length,
          dueTodayPosts: staff.dueTodayPosts.length,
          completedPostsToday: staff.completedPostsToday.length,
        },
      };
    });

  const totals = {
    staff: visibleStaffTasks.length,
    chats: visibleStaffTasks.reduce(
      (sum, staff) => sum + staff.totals.conversations,
      0
    ),
    orders: visibleStaffTasks.reduce(
      (sum, staff) => sum + staff.totals.orders,
      0
    ),
    posts: visibleStaffTasks.reduce(
      (sum, staff) => sum + staff.totals.campaignPosts,
      0
    ),
    overdue: visibleStaffTasks.reduce(
      (sum, staff) => sum + staff.totals.overduePosts,
      0
    ),
    completedToday: visibleStaffTasks.reduce(
      (sum, staff) => sum + staff.totals.completedPostsToday,
      0
    ),
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Staff tasks</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Team task dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          See assigned chats, orders, and campaign posting tasks for each staff
          member.
        </p>
      </section>

      <TasksFilterBar
        staffFilter={staffFilter}
        typeFilter={typeFilter}
        urgencyFilter={urgencyFilter}
        teamMembers={teamMembers}
      />

      {staffFilter !== "all" && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h2 className="text-base font-semibold text-white">My Tasks View</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Showing tasks assigned to{" "}
            {teamMembers.find((member) => member.id === staffFilter)?.name ||
              teamMembers.find((member) => member.id === staffFilter)?.email ||
              "selected staff member"}
            .
          </p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Staff", value: totals.staff, icon: UserRound },
          {
            label: "Assigned chats",
            value: totals.chats,
            icon: MessageSquareText,
          },
          { label: "Assigned orders", value: totals.orders, icon: ShoppingBag },
          { label: "Pending posts", value: totals.posts, icon: CalendarDays },
          {
            label: "Overdue posts",
            value: totals.overdue,
            icon: ClipboardList,
          },
          {
            label: "Completed today",
            value: totals.completedToday,
            icon: ClipboardList,
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

      <section className="space-y-4">
        {visibleStaffTasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks match these filters"
            description="Try viewing all staff, all task types, or all urgency levels to find assigned work."
            actionLabel="View all tasks"
            actionHref="/dashboard/tasks"
          />
        ) : (
          visibleStaffTasks.map((staff) => (
            <div
              key={staff.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <UserRound size={16} className="text-emerald-400" />
                    <h2 className="text-base font-semibold text-white">
                      {staff.name}
                    </h2>
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                      {staff.role}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">{staff.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                    {staff.totals.conversations} chats
                  </span>
                  <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                    {staff.totals.orders} orders
                  </span>
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                    {staff.totals.campaignPosts} posts
                  </span>
                  {staff.totals.overduePosts > 0 && (
                    <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300">
                      {staff.totals.overduePosts} overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Assigned chats
                  </h3>

                  <div className="mt-4 space-y-2">
                    {staff.conversations.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        No assigned chats.
                      </p>
                    ) : (
                      staff.conversations.map((chat) => (
                        <Link
                          key={chat.id}
                          href={`/dashboard/inbox?conversation=${chat.id}`}
                          className="block rounded-2xl border border-white/10 bg-zinc-950/40 p-3 transition hover:bg-zinc-800"
                        >
                          <p className="text-sm font-medium text-white">
                            {chat.customerName || chat.customerPhone}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {chat.workflowStatus} · {chat.priority}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Assigned orders
                  </h3>

                  <div className="mt-4 space-y-2">
                    {staff.orders.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        No assigned orders.
                      </p>
                    ) : (
                      staff.orders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/dashboard/orders/${order.id}`}
                          className="block rounded-2xl border border-white/10 bg-zinc-950/40 p-3 transition hover:bg-zinc-800"
                        >
                          <p className="text-sm font-medium text-white">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {order.status} · ₦
                            {order.totalAmount.toLocaleString()}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Campaign posts
                  </h3>

                  <div className="mt-4 space-y-2">
                    {staff.campaignPosts.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        No pending posts.
                      </p>
                    ) : (
                      staff.campaignPosts.map((post) => {
                        const overdue = post.scheduledAt < new Date();
                        const dueToday =
                          post.scheduledAt.toDateString() ===
                          new Date().toDateString();

                        return (
                          <Link
                            key={post.id}
                            href="/dashboard/campaigns/calendar"
                            className="block rounded-2xl border border-white/10 bg-zinc-950/40 p-3 transition hover:bg-zinc-800"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-white">
                                {post.title}
                              </p>

                              {overdue && (
                                <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[11px] text-red-300">
                                  Overdue
                                </span>
                              )}

                              {!overdue && dueToday && (
                                <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-[11px] text-yellow-300">
                                  Due today
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-zinc-500">
                              {post.platform} ·{" "}
                              {post.scheduledAt.toLocaleString()}
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              {post.campaign.title}
                            </p>

                            {post.completionNotes && (
                              <p className="mt-2 rounded-xl border border-white/10 bg-zinc-950/40 p-2 text-xs leading-5 text-zinc-400">
                                {post.completionNotes}
                              </p>
                            )}
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
