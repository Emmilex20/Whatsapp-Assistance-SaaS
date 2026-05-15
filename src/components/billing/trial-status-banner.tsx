import Link from "next/link";
import { Clock3, ShieldCheck } from "lucide-react";
import type { TrialAccessStatus } from "@/lib/trial-access";

type TrialStatusBannerProps = {
  access: TrialAccessStatus | null;
};

export function TrialStatusBanner({ access }: TrialStatusBannerProps) {
  if (!access || access.paid) return null;

  return (
    <section
      className={`rounded-3xl border p-5 ${
        access.trialActive
          ? "border-blue-400/20 bg-blue-400/10"
          : "border-red-400/20 bg-red-400/10"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              access.trialActive
                ? "bg-blue-400/20 text-blue-100"
                : "bg-red-500 text-white"
            }`}
          >
            {access.trialActive ? <Clock3 size={18} /> : <ShieldCheck size={18} />}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {access.trialActive
                ? `Free trial active: ${access.daysRemaining} day${
                    access.daysRemaining === 1 ? "" : "s"
                  } left`
                : "Your free trial has ended"}
            </h2>
            <p
              className={`mt-2 text-sm leading-6 ${
                access.trialActive ? "text-blue-100" : "text-red-100"
              }`}
            >
              Every new account gets 3 days of limited usage.{" "}
              {access.trialActive
                ? `Your trial ends on ${access.trialEndsAt.toLocaleDateString()}.`
                : "Subscribe now to continue using the dashboard and WhatsApp assistant."}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/billing"
          className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-medium ${
            access.trialActive
              ? "bg-white text-zinc-950 hover:bg-zinc-200"
              : "bg-emerald-500 text-white hover:bg-emerald-400"
          }`}
        >
          {access.trialActive ? "View plans" : "Subscribe now"}
        </Link>
      </div>
    </section>
  );
}
