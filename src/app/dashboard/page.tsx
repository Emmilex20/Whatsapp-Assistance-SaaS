import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  MessageSquareText,
  Settings,
  ShoppingBag,
  Utensils,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getDashboardOverview } from "@/lib/dashboard";

export default async function DashboardPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const overview = restaurant ? await getDashboardOverview(restaurant.id) : null;

  const stats = [
    {
      label: "Total messages",
      value: overview?.stats.totalMessages || 0,
      icon: MessageSquareText,
    },
    {
      label: "Bot replies",
      value: overview?.stats.botReplies || 0,
      icon: Bot,
    },
    {
      label: "New orders",
      value: overview?.stats.newOrders || 0,
      icon: ShoppingBag,
    },
    {
      label: "Menu items",
      value: overview?.stats.menuItems || 0,
      icon: Utensils,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-200">
              Welcome back
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {overview?.restaurant?.name || "Your restaurant"} dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Manage WhatsApp replies, customer conversations, menu setup, and automation performance from one simple place.
            </p>
          </div>

          <Link href="/dashboard/settings/business">
            <Button className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200">
              Complete setup
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <stat.icon size={18} />
            </div>

            <p className="text-sm text-zinc-500">{stat.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {stat.value}
            </h2>
          </div>
        ))}
      </section>

      {Boolean(overview?.stats.newOrders) && (
        <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/20 text-yellow-200">
                <ShoppingBag size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  {overview?.stats.newOrders} order needs confirmation
                </h2>
                <p className="mt-1 text-sm leading-6 text-yellow-100">
                  New WhatsApp orders should be reviewed and confirmed by restaurant staff.
                </p>
              </div>
            </div>

            <Link href="/dashboard/orders">
              <Button className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200">
                Review orders
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Recent conversations
              </h2>
              <p className="text-sm text-zinc-500">
                Latest WhatsApp customer activity.
              </p>
            </div>

            <Link
              href="/dashboard/inbox"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View inbox
            </Link>
          </div>

          <div className="space-y-3">
            {overview?.conversations.length ? (
              overview.conversations.map((conversation) => {
                const lastMessage = conversation.messages[0]?.content;

                return (
                  <Link
                    key={conversation.id}
                    href={`/dashboard/inbox?conversation=${conversation.id}`}
                    className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {conversation.customerName ||
                            conversation.customerPhone}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {conversation.customerPhone}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          conversation.status === "HUMAN_TAKEOVER"
                            ? "bg-blue-400/10 text-blue-300"
                            : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {conversation.status === "HUMAN_TAKEOVER"
                          ? "Human"
                          : "Bot"}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-1 text-sm text-zinc-400">
                      {lastMessage || "No messages yet"}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No conversations yet. Send a mock webhook message or connect WhatsApp Cloud API.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Setup progress
                </h2>
                <p className="text-sm text-zinc-500">
                  Prepare the restaurant for real automation.
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                {overview?.stats.setupProgress || 0}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{
                  width: `${overview?.stats.setupProgress || 0}%`,
                }}
              />
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Restaurant profile",
                  done:
                    Boolean(overview?.restaurant?.name) &&
                    overview?.restaurant?.name !== "My Restaurant",
                  href: "/dashboard/settings/business",
                  icon: Settings,
                },
                {
                  label: "WhatsApp setup",
                  done: Boolean(overview?.restaurant?.whatsappPhoneNumberId),
                  href: "/dashboard/settings/business",
                  icon: MessageSquareText,
                },
                {
                  label: "Menu items",
                  done: Boolean(overview?.stats.menuItems),
                  href: "/dashboard/menu",
                  icon: Utensils,
                },
                {
                  label: "FAQs",
                  done: Boolean(overview?.stats.faqs),
                  href: "/dashboard/automations/faqs",
                  icon: CheckCircle2,
                },
                {
                  label: "Automation rules",
                  done: Boolean(overview?.automations.length),
                  href: "/dashboard/automations",
                  icon: Workflow,
                },
              ].map((item) => (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={17}
                      className={
                        item.done ? "text-emerald-400" : "text-zinc-500"
                      }
                    />
                    <p className="text-sm text-white">{item.label}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.done
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-yellow-400/10 text-yellow-300"
                    }`}
                  >
                    {item.done ? "Done" : "Pending"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Latest automations
                </h2>
                <p className="text-sm text-zinc-500">
                  Recently created reply rules.
                </p>
              </div>

              <Link
                href="/dashboard/automations"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {overview?.automations.length ? (
                overview.automations.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {rule.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {rule.triggers.join(", ")}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                        {rule.usedCount} uses
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                  No automation rules yet. Create menu, delivery, and order rules.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Recent orders
                </h2>
                <p className="text-sm text-zinc-500">
                  Latest customer order activity.
                </p>
              </div>

              <Link
                href="/dashboard/orders"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {overview?.orders.length ? (
                overview.orders.map((order) => (
                  <Link
                    key={order.id}
                    href="/dashboard/orders"
                    className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {order.items[0]?.name || "No item"} · ₦{order.totalAmount.toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          order.status === "NEW"
                            ? "bg-yellow-400/10 text-yellow-300"
                            : order.status === "CANCELLED"
                              ? "bg-red-400/10 text-red-300"
                              : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                  No orders yet. WhatsApp and manual orders will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
