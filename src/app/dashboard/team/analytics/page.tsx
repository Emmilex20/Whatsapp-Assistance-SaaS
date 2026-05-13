import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  MessageSquareText,
  ShoppingBag,
  UserRoundCheck,
  Wallet,
} from "lucide-react";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getTeamAnalytics } from "@/lib/team-analytics";

export default async function TeamAnalyticsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();
  const analytics = restaurant ? await getTeamAnalytics(restaurant.id) : [];

  const totals = {
    agents: analytics.length,
    chats: analytics.reduce((sum, agent) => sum + agent.assignedChats, 0),
    orders: analytics.reduce((sum, agent) => sum + agent.assignedOrders, 0),
    replies: analytics.reduce((sum, agent) => sum + agent.humanReplies, 0),
    value: analytics.reduce((sum, agent) => sum + agent.orderValue, 0),
  };

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/team"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to team
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Agent analytics
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Team performance
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review assigned chats, orders, replies, and order value handled by
          your team members.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Agents",
            value: totals.agents,
            icon: UserRoundCheck,
          },
          {
            label: "Assigned chats",
            value: totals.chats,
            icon: MessageSquareText,
          },
          {
            label: "Assigned orders",
            value: totals.orders,
            icon: ShoppingBag,
          },
          {
            label: "Human replies",
            value: totals.replies,
            icon: BarChart3,
          },
          {
            label: "Order value",
            value: `₦${totals.value.toLocaleString()}`,
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
        <h2 className="text-base font-semibold text-white">Agent breakdown</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Workload and performance by team member.
        </p>

        <div className="mt-5 space-y-3">
          {analytics.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
              No team members yet. Invite agents and assign chats or orders to
              see performance.
            </div>
          ) : (
            analytics.map((agent) => (
              <div
                key={agent.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {agent.name}
                      </h3>

                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                        {agent.role}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">{agent.email}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-130">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Chats</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {agent.assignedChats}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Orders</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {agent.assignedOrders}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Replies</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {agent.humanReplies}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Active orders</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {agent.activeOrders}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Delivered</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {agent.deliveredOrders}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
                      <p className="text-xs text-zinc-500">Order value</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        ₦{agent.orderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
