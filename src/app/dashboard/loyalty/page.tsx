import Link from "next/link";
import {
  BadgePercent,
  Crown,
  Gift,
  HeartHandshake,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import {
  getLoyaltyRecommendation,
  syncRestaurantCustomerLoyalty,
} from "@/lib/customer-loyalty";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

type LoyaltyPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

const filters = [
  { label: "All customers", value: "all" },
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "VIP", value: "vip" },
  { label: "Inactive risk", value: "inactive" },
];

function tierClass(tier: string) {
  if (tier === "vip") return "bg-purple-400/10 text-purple-300";
  if (tier === "gold") return "bg-yellow-400/10 text-yellow-300";
  if (tier === "silver") return "bg-zinc-300/10 text-zinc-200";
  return "bg-orange-400/10 text-orange-300";
}

function loyaltyHref(filter: string) {
  return filter === "all" ? "/dashboard/loyalty" : `/dashboard/loyalty?filter=${filter}`;
}

export default async function LoyaltyPage({ searchParams }: LoyaltyPageProps) {
  await requirePermission("manage_reports");

  const params = await searchParams;
  const filter = params.filter || "all";
  const restaurant = await getOrCreateCurrentRestaurant();

  if (restaurant) {
    await syncRestaurantCustomerLoyalty(restaurant.id);
  }

  const where = {
    restaurantId: restaurant?.id || "",
    ...(filter === "inactive"
      ? { inactiveRisk: true }
      : filter !== "all"
        ? { loyaltyTier: filter }
        : {}),
  };

  const loyaltyCustomers = restaurant
    ? await prisma.customerLoyalty.findMany({
        where,
        orderBy: [{ vip: "desc" }, { totalSpent: "desc" }, { totalOrders: "desc" }],
      })
    : [];

  const allLoyalty = restaurant
    ? await prisma.customerLoyalty.findMany({
        where: { restaurantId: restaurant.id },
      })
    : [];

  const totals = {
    customers: allLoyalty.length,
    vip: allLoyalty.filter((customer) => customer.vip).length,
    inactive: allLoyalty.filter((customer) => customer.inactiveRisk).length,
    points: allLoyalty.reduce((sum, customer) => sum + customer.points, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loyalty"
        title="Loyalty and VIP customers"
        description="Track loyal customers, reward repeat buyers, and spot customers who may need a re-engagement message."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tracked customers" value={totals.customers} icon={UserRound} />
        <MetricCard label="VIP customers" value={totals.vip} icon={Crown} />
        <MetricCard label="Inactive risk" value={totals.inactive} icon={ShieldAlert} />
        <MetricCard
          label="Total points"
          value={totals.points.toLocaleString()}
          icon={Trophy}
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
          Filter loyalty tiers
        </p>
        <div className="action-row">
          {filters.map((item) => (
            <a
              key={item.value}
              href={loyaltyHref(item.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                filter === item.value
                  ? "bg-emerald-500 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-1 text-emerald-300" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Smart rewards guidance
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Loyalty tiers update from real order history. Use the recommendations
              to send discounts, reward frequent buyers, or re-engage customers
              who have not ordered recently.
            </p>
          </div>
        </div>
      </section>

      {loyaltyCustomers.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No loyalty customers yet"
          description="Customers will enter loyalty tracking after they place orders. Create or receive orders first, then return here for reward recommendations."
          actionLabel="View orders"
          actionHref="/dashboard/orders"
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {loyaltyCustomers.map((customer) => {
            const recommendation = getLoyaltyRecommendation({
              loyaltyTier: customer.loyaltyTier,
              inactiveRisk: customer.inactiveRisk,
              totalOrders: customer.totalOrders,
              totalSpent: customer.totalSpent,
            });

            return (
              <div
                key={customer.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-semibold text-white">
                        {customer.customerName || customer.customerPhone}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${tierClass(
                          customer.loyaltyTier
                        )}`}
                      >
                        {customer.loyaltyTier}
                      </span>
                      {customer.vip && (
                        <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                          VIP
                        </span>
                      )}
                      {customer.inactiveRisk && (
                        <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300">
                          Inactive risk
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      {customer.customerPhone}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/customer-memory?filter=active`}
                    className="inline-flex h-9 shrink-0 items-center rounded-full bg-white/[0.04] px-4 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    View memory
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <p className="text-xs text-zinc-500">Orders</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {customer.totalOrders}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <p className="text-xs text-zinc-500">Total spent</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      ₦{customer.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <p className="text-xs text-zinc-500">Points</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {customer.points.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    {recommendation.label === "Send discount" ? (
                      <BadgePercent size={16} className="text-emerald-300" />
                    ) : recommendation.label === "Reward loyal customer" ? (
                      <Gift size={16} className="text-emerald-300" />
                    ) : recommendation.label === "Re-engage customer" ? (
                      <RefreshCcw size={16} className="text-emerald-300" />
                    ) : (
                      <Sparkles size={16} className="text-emerald-300" />
                    )}
                    AI recommendation: {recommendation.label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {recommendation.message}
                  </p>
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                  Last order:{" "}
                  {customer.lastOrderAt
                    ? customer.lastOrderAt.toLocaleDateString()
                    : "No completed order yet"}
                </p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
