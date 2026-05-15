"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrialAccessStatus } from "@/lib/trial-access";

type TrialAccessGateProps = {
  access: TrialAccessStatus | null;
  children: React.ReactNode;
};

const allowedWhenExpired = [
  "/dashboard/billing",
  "/dashboard/subscription-required",
  "/dashboard/unauthorized",
];

export function TrialAccessGate({ access, children }: TrialAccessGateProps) {
  const pathname = usePathname();
  const canShowPage =
    !access ||
    access.allowed ||
    allowedWhenExpired.some((path) => pathname.startsWith(path));

  if (canShowPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center shadow-2xl shadow-emerald-950/30 sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <LockKeyhole size={24} />
        </div>

        <p className="mt-5 text-sm font-medium text-emerald-300">
          Trial complete
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Subscribe to continue using ServeFlow
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-300">
          Every new account gets 3 days of limited usage. Your free trial has
          ended, so choose a plan to reopen the dashboard, automations,
          campaigns, AI tools, and WhatsApp assistant features.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 text-left">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="mt-0.5 text-emerald-300" />
            <p className="text-sm leading-6 text-zinc-300">
              Payments are handled by Paystack. Once payment succeeds, your
              subscription is verified and access returns automatically.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-10 rounded-full bg-emerald-500 px-6 text-sm text-white hover:bg-emerald-400"
          >
            <Link href="/dashboard/billing">Choose a plan</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-white/10 bg-white/[0.03] px-6 text-sm text-white hover:bg-white/10"
          >
            <Link href="/">Back to website</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
