import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Icon size={18} />
        </div>
      )}

      <p className="text-sm text-zinc-500">{label}</p>

      <h2 className="mt-2 text-2xl font-semibold text-white">{value}</h2>

      {description && (
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      )}
    </div>
  );
}
