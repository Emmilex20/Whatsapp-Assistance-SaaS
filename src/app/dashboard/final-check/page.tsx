import Link from "next/link";
import { CheckCircle2, Rocket, ShieldCheck, Smartphone } from "lucide-react";
import { finalPolishChecklist } from "@/lib/final-polish-checklist";

export default function FinalCheckPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Final polish</p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Dashboard readiness checklist
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Use this checklist before deployment and pilot launch.
          </p>
        </div>

        <div className="action-row">
          <Link
            href="/dashboard/final-check/launch"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Rocket className="mr-2" size={16} />
            Final launch
          </Link>

          <Link
            href="/dashboard/final-check/deployment"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Rocket className="mr-2" size={16} />
            Deployment checklist
          </Link>

          <Link
            href="/dashboard/final-check/pilot-launch"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Rocket className="mr-2" size={16} />
            Pilot launch checklist
          </Link>

          <Link
            href="/dashboard/final-check/mobile"
            className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
          >
            <Smartphone className="mr-2" size={16} />
            Mobile audit
          </Link>

          <Link
            href="/dashboard/final-check/security"
            className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
          >
            <ShieldCheck className="mr-2" size={16} />
            Security review
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="space-y-3">
          {finalPolishChecklist.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <CheckCircle2 size={18} className="mt-0.5 text-emerald-400" />

              <p className="text-sm leading-6 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
