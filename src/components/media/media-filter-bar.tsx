"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { StyledFilterDropdown } from "@/components/shared/styled-filter-dropdown";
import { mediaPromptTemplates } from "@/lib/media/templates";

type MediaFilterBarProps = {
  templateFilter: string;
  statusFilter: string;
  favoriteFilter: string;
  captionFilter: string;
};

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Skipped", value: "SKIPPED" },
  { label: "Failed", value: "FAILED" },
];

const favoriteOptions = [
  { label: "All assets", value: "all" },
  { label: "Favorites only", value: "favorites" },
];

const captionOptions = [
  { label: "All captions", value: "all" },
  { label: "With caption", value: "with_caption" },
  { label: "Without caption", value: "without_caption" },
];

export function MediaFilterBar({
  templateFilter,
  statusFilter,
  favoriteFilter,
  captionFilter,
}: MediaFilterBarProps) {
  const router = useRouter();

  function updateFilter(
    key: "template" | "status" | "favorite" | "caption",
    value: string
  ) {
    const query = new URLSearchParams();
    const nextFilters = {
      template: templateFilter,
      status: statusFilter,
      favorite: favoriteFilter,
      caption: captionFilter,
      [key]: value,
    };

    Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        query.set(filterKey, filterValue);
      }
    });

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/media?${queryString}` : "/dashboard/media");
  }

  const templateOptions = [
    { label: "All templates", value: "all" },
    ...mediaPromptTemplates.map((template) => ({
      label: template.name,
      value: template.id,
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
          <p className="text-sm text-zinc-500">Refine the media gallery.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StyledFilterDropdown
          label="Template"
          value={templateFilter}
          options={templateOptions}
          onChange={(value) => updateFilter("template", value)}
        />

        <StyledFilterDropdown
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={(value) => updateFilter("status", value)}
        />

        <StyledFilterDropdown
          label="Favorites"
          value={favoriteFilter}
          options={favoriteOptions}
          onChange={(value) => updateFilter("favorite", value)}
        />

        <StyledFilterDropdown
          label="Captions"
          value={captionFilter}
          options={captionOptions}
          onChange={(value) => updateFilter("caption", value)}
        />
      </div>
    </section>
  );
}
