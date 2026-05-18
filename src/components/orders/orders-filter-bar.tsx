"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { StyledFilterDropdown } from "@/components/shared/styled-filter-dropdown";

type TeamMemberOption = {
  id: string;
  name: string | null;
  email: string;
};

type OrdersFilterBarProps = {
  assignedFilter: string;
  statusFilter: string;
  teamMembers: TeamMemberOption[];
};

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "New", value: "NEW" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function OrdersFilterBar({
  assignedFilter,
  statusFilter,
  teamMembers,
}: OrdersFilterBarProps) {
  const router = useRouter();

  function updateFilter(key: "assigned" | "status", value: string) {
    const query = new URLSearchParams();
    const nextFilters = {
      assigned: assignedFilter,
      status: statusFilter,
      [key]: value,
    };

    Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        query.set(filterKey, filterValue);
      }
    });

    const queryString = query.toString();
    router.push(
      queryString ? `/dashboard/orders?${queryString}` : "/dashboard/orders"
    );
  }

  const assigneeOptions = [
    { label: "All orders", value: "all" },
    { label: "Unassigned", value: "unassigned" },
    ...teamMembers.map((member) => ({
      label: member.name || member.email,
      value: member.id,
    })),
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Filter size={16} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Filters</h2>
          <p className="text-sm text-zinc-500">Refine the order list.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <StyledFilterDropdown
          label="Assignee"
          value={assignedFilter}
          options={assigneeOptions}
          onChange={(value) => updateFilter("assigned", value)}
        />

        <StyledFilterDropdown
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={(value) => updateFilter("status", value)}
        />
      </div>
    </section>
  );
}
