import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type UpgradeNoticeProps = {
  title?: string;
  description?: string;
};

export function UpgradeNotice({
  title = "Need more capacity?",
  description = "Upgrade your plan to unlock more automations, menu items, delivery zones, and message volume.",
}: UpgradeNoticeProps) {
  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>

      <Link href="/dashboard/billing">
        <Button className="mt-5 h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200">
          View plans
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </Link>
    </div>
  );
}
