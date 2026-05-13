import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, Rocket } from "lucide-react";
import { getEnvStatus, validateEnv } from "@/lib/env";

export default function ProductionChecklistPage() {
  const env = validateEnv();
  const envStatus = getEnvStatus();

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/launch"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to launch
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          Production readiness
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Deployment checklist
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Confirm environment variables, integrations, and deployment settings
          before onboarding real restaurants.
        </p>
      </section>

      <section
        className={`rounded-3xl border p-5 ${
          env.valid
            ? "border-emerald-400/20 bg-emerald-400/10"
            : "border-yellow-400/20 bg-yellow-400/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              env.valid
                ? "bg-emerald-500 text-white"
                : "bg-yellow-400/20 text-yellow-100"
            }`}
          >
            {env.valid ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {env.valid
                ? "Environment is ready"
                : "Missing environment variables"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {env.valid
                ? "All required variables are configured."
                : `Missing: ${env.missing.join(", ")}`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Environment variables
          </h2>

          <div className="mt-5 space-y-3">
            {envStatus.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <code className="text-xs text-zinc-300">{item.key}</code>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
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
          <div className="mb-5 flex items-center gap-3">
            <Rocket size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Deployment steps
              </h2>
              <p className="text-sm text-zinc-500">
                Follow this order before public launch.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              "Push project to GitHub.",
              "Create PostgreSQL database.",
              "Add DATABASE_URL to Vercel.",
              "Add Clerk keys to Vercel.",
              "Add Paystack keys and plan codes.",
              "Add WhatsApp Cloud API credentials.",
              "Set NEXT_PUBLIC_APP_URL to deployed domain.",
              "Run Prisma db push during deployment setup.",
              "Add Paystack webhook URL.",
              "Add WhatsApp webhook callback URL.",
              "Keep WHATSAPP_SEND_ENABLED=false until final testing is complete.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
