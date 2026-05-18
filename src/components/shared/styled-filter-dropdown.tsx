"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type StyledFilterOption = {
  label: string;
  value: string;
};

type StyledFilterDropdownProps = {
  label: string;
  value: string;
  options: StyledFilterOption[];
  onChange: (value: string) => void;
};

export function StyledFilterDropdown({
  label,
  value,
  options,
  onChange,
}: StyledFilterDropdownProps) {
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
