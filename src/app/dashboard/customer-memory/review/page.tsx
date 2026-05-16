import Link from "next/link";
import { ArrowLeft, BrainCircuit, Phone, ShieldCheck } from "lucide-react";
import { CustomerMemoryReviewCard } from "@/components/customer-memory/customer-memory-review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export default async function CustomerMemoryReviewPage() {
  await requirePermission("manage_ai");

  const restaurant = await getOrCreateCurrentRestaurant();

  const memories = restaurant
    ? await prisma.customerMemory.findMany({
        where: {
          restaurantId: restaurant.id,
          reviewStatus: "PENDING",
        },
        orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const groupedMemories = memories.reduce<
    Record<string, typeof memories>
  >((groups, memory) => {
    groups[memory.customerPhone] = groups[memory.customerPhone] || [];
    groups[memory.customerPhone].push(memory);
    return groups;
  }, {});

  const lowConfidenceCount = memories.filter(
    (memory) => memory.confidence < 80
  ).length;

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/customer-memory"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to customer memory
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Memory review queue
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Review detected customer preferences
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Low-confidence detected memories stay here until a staff member
          approves, edits, or rejects them.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Pending memories", value: memories.length },
          { label: "Low confidence", value: lowConfidenceCount },
          { label: "Customers", value: Object.keys(groupedMemories).length },
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

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-1 text-yellow-100" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Approval keeps AI context clean
            </h2>
            <p className="mt-2 text-sm leading-6 text-yellow-100">
              Approved memories become active AI context. Rejected memories stay
              inactive and are not used for customer replies.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Pending memories
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Grouped by customer phone number.
        </p>

        <div className="mt-5 space-y-5">
          {memories.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No memories need review"
              description="Low-confidence customer preferences detected from chats or orders will appear here before entering AI context."
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
                    {items.length} pending
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((memory) => (
                    <CustomerMemoryReviewCard
                      key={memory.id}
                      memory={memory}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
