import { ShieldCheck } from "lucide-react";
import { securityChecklist } from "@/lib/security-checklist";

export default function SecurityReviewPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Security review
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Launch security checklist
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review these items before deploying and onboarding real restaurants.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="space-y-3">
          {securityChecklist.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <ShieldCheck size={18} className="mt-0.5 text-emerald-400" />

              <p className="text-sm leading-6 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
