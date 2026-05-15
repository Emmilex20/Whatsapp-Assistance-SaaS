import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import {
  handoverChecklist,
  launchReadinessChecklist,
  postLaunchMonitoringChecklist,
} from "@/lib/launch-readiness-checklist";
import { requirePermission } from "@/lib/require-permission";

function ChecklistSection({
  title,
  description,
  items,
  icon: Icon,
}: {
  title: string;
  description: string;
  items: string[];
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
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
  );
}

export default async function FinalLaunchPage() {
  await requirePermission("manage_settings");

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Final launch</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Launch readiness and handover
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Use this as the final gate before putting a real restaurant on the
          WhatsApp assistant.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <Rocket size={18} className="mt-1 text-emerald-300" />

          <div>
            <h2 className="text-base font-semibold text-white">
              Pilot-ready definition
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              ServeFlow is pilot-ready when WhatsApp inbound/outbound tests
              pass, restaurant data is complete, AI safety is verified, staff
              can take over conversations, reports export correctly, and the
              first pilot owner understands how to operate the dashboard.
            </p>
          </div>
        </div>
      </section>

      <ChecklistSection
        title="Launch readiness checklist"
        description="Complete these before switching the restaurant into real usage."
        items={launchReadinessChecklist}
        icon={ShieldCheck}
      />

      <ChecklistSection
        title="Owner handover checklist"
        description="Use this during onboarding/training for the restaurant owner or manager."
        items={handoverChecklist}
        icon={Handshake}
      />

      <ChecklistSection
        title="Post-launch monitoring checklist"
        description="Use this during the first few days after launch."
        items={postLaunchMonitoringChecklist}
        icon={ClipboardCheck}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/final-check/deployment"
          className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 transition hover:bg-blue-400/20"
        >
          <h2 className="text-base font-semibold text-white">
            Deployment checklist
          </h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Confirm live environment, domain, database, and webhook settings.
          </p>
        </Link>

        <Link
          href="/dashboard/final-check/pilot-launch"
          className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 transition hover:bg-yellow-400/20"
        >
          <h2 className="text-base font-semibold text-white">
            Pilot checklist
          </h2>
          <p className="mt-2 text-sm leading-6 text-yellow-100">
            Confirm restaurant readiness before real customer usage.
          </p>
        </Link>
      </section>
    </div>
  );
}
