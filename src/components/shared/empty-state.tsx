import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: string;
  href?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  action,
  href,
}: EmptyStateProps) {
  const label = actionLabel || action;
  const target = actionHref || href;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
        <Icon size={22} />
      </div>

      <h2 className="mt-5 text-base font-semibold text-white">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {description}
      </p>

      {label && target && (
        <Link href={target}>
          <Button className="mt-5 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            {label}
          </Button>
        </Link>
      )}

      {label && !target && (
        <Button className="mt-5 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          {label}
        </Button>
      )}
    </div>
  );
}
