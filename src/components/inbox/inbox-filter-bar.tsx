"use client";

import { ChevronDown, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type FilterOption = {
  label: string;
  value: string;
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

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex h-11 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/80 px-3 text-left text-sm text-white outline-none transition hover:border-emerald-400/30 hover:bg-zinc-900 focus-visible:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-400/10"
          >
            <span className="min-w-0 truncate">{selectedOption.label}</span>
            <ChevronDown
              size={16}
              className="shrink-0 text-zinc-500 transition group-data-[state=open]:rotate-180 group-hover:text-emerald-300"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="max-h-72 rounded-2xl border border-white/10 bg-zinc-950 p-2 text-white shadow-2xl shadow-black/40"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">
            {label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="min-h-10 cursor-pointer rounded-xl px-3 py-2 pr-8 text-sm text-zinc-300 focus:bg-emerald-400/10 focus:text-white data-[state=checked]:bg-emerald-400/10 data-[state=checked]:text-emerald-200"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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
        <FilterDropdown
          label="Assignee"
          value={assignedFilter}
          options={assigneeOptions}
          onChange={(value) => updateFilter("assigned", value)}
        />

        <FilterDropdown
          label="Priority"
          value={priorityFilter}
          options={priorityOptions}
          onChange={(value) => updateFilter("priority", value)}
        />

        <FilterDropdown
          label="Response"
          value={slaFilter}
          options={slaOptions}
          onChange={(value) => updateFilter("sla", value)}
        />

        <FilterDropdown
          label="Status"
          value={workflowFilter}
          options={workflowOptions}
          onChange={(value) => updateFilter("workflow", value)}
        />
      </div>
    </section>
  );
}
