"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { StyledFilterDropdown } from "@/components/shared/styled-filter-dropdown";

type TeamMemberOption = {
  id: string;
  name: string | null;
  email: string;
};

type InboxFilterBarProps = {
  assignedFilter: string;
  priorityFilter: string;
  slaFilter: string;
  workflowFilter: string;
  teamMembers: TeamMemberOption[];
};

const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "Low", value: "LOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

const slaOptions = [
  { label: "All SLA", value: "all" },
  { label: "Needs reply", value: "needs_reply" },
  { label: "Overdue", value: "overdue" },
  { label: "Replied", value: "replied" },
];

const workflowOptions = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "OPEN" },
  { label: "Pending", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
];

export function InboxFilterBar({
  assignedFilter,
  priorityFilter,
  slaFilter,
  workflowFilter,
  teamMembers,
}: InboxFilterBarProps) {
  const router = useRouter();

  function updateFilter(
    key: "assigned" | "priority" | "sla" | "workflow",
    value: string
  ) {
    const query = new URLSearchParams();
    const nextFilters = {
      assigned: assignedFilter,
      priority: priorityFilter,
      sla: slaFilter,
      workflow: workflowFilter,
      [key]: value,
    };

    Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        query.set(filterKey, filterValue);
      }
    });

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/inbox?${queryString}` : "/dashboard/inbox");
  }

  const assigneeOptions = [
    { label: "All chats", value: "all" },
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
          <p className="text-sm text-zinc-500">Refine the conversation list.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StyledFilterDropdown
          label="Assignee"
          value={assignedFilter}
          options={assigneeOptions}
          onChange={(value) => updateFilter("assigned", value)}
        />

        <StyledFilterDropdown
          label="Priority"
          value={priorityFilter}
          options={priorityOptions}
          onChange={(value) => updateFilter("priority", value)}
        />

        <StyledFilterDropdown
          label="Response"
          value={slaFilter}
          options={slaOptions}
          onChange={(value) => updateFilter("sla", value)}
        />

        <StyledFilterDropdown
          label="Status"
          value={workflowFilter}
          options={workflowOptions}
          onChange={(value) => updateFilter("workflow", value)}
        />
      </div>
    </section>
  );
}
