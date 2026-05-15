import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Rocket,
} from "lucide-react";
import { getProductionEnvStatus } from "@/lib/env-status";
import { productionChecklist } from "@/lib/production-checklist";
import { requirePermission } from "@/lib/require-permission";

export default async function DeploymentChecklistPage() {
  await requirePermission("manage_settings");

  const envStatus = getProductionEnvStatus();
  const missingRequired = envStatus.required.filter((item) => !item.configured);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Production deployment
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Deployment readiness checklist
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review production environment variables, deployment steps, and launch
          blockers before onboarding real restaurants.
        </p>
      </section>

      <section
        className={`rounded-3xl border p-5 ${
          missingRequired.length
            ? "border-red-400/20 bg-red-400/10"
            : "border-emerald-400/20 bg-emerald-400/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              missingRequired.length
                ? "bg-red-500 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {missingRequired.length ? (
              <CircleAlert size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {missingRequired.length
                ? "Production environment is incomplete"
                : "Production environment looks ready"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {missingRequired.length
                ? `${missingRequired.length} required environment variable(s) are missing.`
                : "All required environment variables are configured."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Required environment variables
          </h2>

          <div className="mt-5 space-y-3">
            {envStatus.required.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div>
                  <code className="break-all text-xs text-zinc-300">
                    {item.key}
                  </code>

                  {item.value && (
                    <p className="mt-1 text-xs text-zinc-500">{item.value}</p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    item.configured
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-red-400/10 text-red-300"
                  }`}
                >
                  {item.configured ? "Set" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Optional environment variables
          </h2>

          <div className="mt-5 space-y-3">
            {envStatus.optional.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div>
                  <code className="break-all text-xs text-zinc-300">
                    {item.key}
                  </code>

                  {item.value && (
                    <p className="mt-1 text-xs text-zinc-500">{item.value}</p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    item.configured
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-zinc-400/10 text-zinc-300"
                  }`}
                >
                  {item.configured ? "Set" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Launch checklist
        </h2>

        <div className="mt-5 space-y-3">
          {productionChecklist.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <Rocket size={18} className="mt-0.5 text-emerald-400" />

              <p className="text-sm leading-6 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">Deployment flow</h2>

        <div className="mt-5 space-y-3">
          {[
            "Push latest code to GitHub.",
            "Connect project to Vercel if not already connected.",
            "Add all production environment variables in Vercel.",
            "Connect production database provider.",
            "Run Prisma migration or db push against production database.",
            "Deploy and confirm dashboard loads.",
            "Configure Meta WhatsApp webhook with live callback URL.",
            "Send real inbound WhatsApp test message.",
            "Only then enable WHATSAPP_SEND_ENABLED=true.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm leading-6 text-blue-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="action-row">
        <Link
          href="/dashboard/final-check/pilot-launch"
          className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
        >
          Pilot launch checklist
        </Link>

        <Link
          href="/dashboard/final-check/security"
          className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
        >
          Security review
        </Link>

        <Link
          href="/dashboard/final-check/mobile"
          className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
        >
          Mobile audit
        </Link>

        <a
          href="https://vercel.com/docs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
        >
          Vercel docs
          <ExternalLink className="ml-2" size={16} />
        </a>
      </section>
    </div>
  );
}
