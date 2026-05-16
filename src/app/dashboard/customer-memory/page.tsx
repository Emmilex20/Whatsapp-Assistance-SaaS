import Link from "next/link";
import { BrainCircuit, Phone, ShieldCheck } from "lucide-react";
import { CreateCustomerMemoryForm } from "@/components/customer-memory/create-customer-memory-form";
import { CustomerMemoryCard } from "@/components/customer-memory/customer-memory-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

type CustomerMemoryPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

function filterHref(filter: string) {
  return filter === "active"
    ? "/dashboard/customer-memory"
    : `/dashboard/customer-memory?filter=${filter}`;
}

export default async function CustomerMemoryPage({
  searchParams,
}: CustomerMemoryPageProps) {
  await requirePermission("manage_ai");

  const params = await searchParams;
  const filter = params.filter || "active";
  const restaurant = await getOrCreateCurrentRestaurant();

  const memories = restaurant
    ? await prisma.customerMemory.findMany({
        where: {
          restaurantId: restaurant.id,
          ...(filter === "archived"
            ? { active: false, reviewStatus: "APPROVED" }
            : { active: true, reviewStatus: "APPROVED" }),
          ...(filter === "high-confidence" ? { confidence: { gte: 80 } } : {}),
        },
        orderBy: [{ customerPhone: "asc" }, { updatedAt: "desc" }],
      })
    : [];

  const groupedMemories = memories.reduce<
    Record<string, typeof memories>
  >((groups, memory) => {
    groups[memory.customerPhone] = groups[memory.customerPhone] || [];
    groups[memory.customerPhone].push(memory);
    return groups;
  }, {});

  const totalActive = restaurant
    ? await prisma.customerMemory.count({
        where: {
          restaurantId: restaurant.id,
          active: true,
          reviewStatus: "APPROVED",
        },
      })
    : 0;
  const totalArchived = restaurant
    ? await prisma.customerMemory.count({
        where: {
          restaurantId: restaurant.id,
          active: false,
          reviewStatus: "APPROVED",
        },
      })
    : 0;
  const totalHighConfidence = restaurant
    ? await prisma.customerMemory.count({
        where: {
          restaurantId: restaurant.id,
          active: true,
          reviewStatus: "APPROVED",
          confidence: { gte: 80 },
        },
      })
    : 0;
  const totalPending = restaurant
    ? await prisma.customerMemory.count({
        where: {
          restaurantId: restaurant.id,
          reviewStatus: "PENDING",
        },
      })
    : 0;

  const filters = [
    { label: "Active", value: "active", count: totalActive },
    { label: "Archived", value: "archived", count: totalArchived },
    {
      label: "High confidence",
      value: "high-confidence",
      count: totalHighConfidence,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            AI customer memory
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Customer memory foundation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Save reusable customer preferences that AI can use as context for
            future suggestions and personalization. Detected memories may
            require review before they become active.
          </p>
        </div>

        <Link
          href="/dashboard/customer-memory/review"
          className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
        >
          Review queue ({totalPending})
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active memories", value: totalActive },
          { label: "Archived memories", value: totalArchived },
          { label: "High confidence", value: totalHighConfidence },
          { label: "Needs review", value: totalPending },
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

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-1 text-emerald-300" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Memory safety rule
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Only save preferences the restaurant is comfortable using in AI
              replies. Low-confidence detected memories wait for review before
              entering AI context.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <CreateCustomerMemoryForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Saved customer memories
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Grouped by customer phone number.
              </p>
            </div>

            <div className="action-row">
              {filters.map((item) => (
                <Link
                  key={item.value}
                  href={filterHref(item.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    filter === item.value
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label} ({item.count})
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {memories.length === 0 ? (
              <EmptyState
                icon={BrainCircuit}
                title="No customer memories yet"
                description="Add customer preferences such as favorite meals, delivery preferences, spice level, allergy notes, or ordering habits."
              />
            ) : (
              Object.entries(groupedMemories).map(([customerPhone, items]) => (
                <div key={customerPhone} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Phone size={15} className="text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">
                      {customerPhone}
                    </h3>
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                      {items.length} memor{items.length === 1 ? "y" : "ies"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((memory) => (
                      <CustomerMemoryCard key={memory.id} memory={memory} />
                    ))}
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
