"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { StyledFilterDropdown } from "@/components/shared/styled-filter-dropdown";

type TeamMemberOption = {
  id: string;
  name: string | null;
  email: string;
};

type TasksFilterBarProps = {
  staffFilter: string;
  typeFilter: string;
  urgencyFilter: string;
  teamMembers: TeamMemberOption[];
};

const taskTypeOptions = [
  { label: "All tasks", value: "all" },
  { label: "Chats", value: "chats" },
  { label: "Orders", value: "orders" },
  { label: "Campaign posts", value: "posts" },
];

const urgencyOptions = [
  { label: "All urgency", value: "all" },
  { label: "Overdue posts", value: "overdue" },
  { label: "Due today", value: "due_today" },
];

export function TasksFilterBar({
  staffFilter,
  typeFilter,
  urgencyFilter,
  teamMembers,
}: TasksFilterBarProps) {
  const router = useRouter();

  function updateFilter(key: "staff" | "type" | "urgency", value: string) {
    const query = new URLSearchParams();
    const nextFilters = {
      staff: staffFilter,
      type: typeFilter,
      urgency: urgencyFilter,
      [key]: value,
    };

    Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        query.set(filterKey, filterValue);
      }
    });

    const queryString = query.toString();
    router.push(
      queryString ? `/dashboard/tasks?${queryString}` : "/dashboard/tasks"
    );
  }

  const staffOptions = [
    { label: "All staff", value: "all" },
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
          <p className="text-sm text-zinc-500">Refine team workload.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StyledFilterDropdown
          label="Staff member"
          value={staffFilter}
          options={staffOptions}
          onChange={(value) => updateFilter("staff", value)}
        />

        <StyledFilterDropdown
          label="Task type"
          value={typeFilter}
          options={taskTypeOptions}
          onChange={(value) => updateFilter("type", value)}
        />

        <StyledFilterDropdown
          label="Urgency"
          value={urgencyFilter}
          options={urgencyOptions}
          onChange={(value) => updateFilter("urgency", value)}
        />
      </div>
    </section>
  );
}
