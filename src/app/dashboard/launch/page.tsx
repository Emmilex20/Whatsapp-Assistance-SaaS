import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Rocket } from "lucide-react";
import { launchChecklist } from "@/lib/site";

export default function LaunchPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <Rocket size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-emerald-200">
              Launch foundation
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Prepare ServeFlow for real businesses
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
          This page tracks what is ready and what still needs to be connected
          before onboarding restaurants publicly.
        </p>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Production deployment checklist
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Check environment variables and deployment steps before
              onboarding real restaurants.
            </p>
          </div>

          <Link href="/dashboard/launch/production">
            <button className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-200">
              Open checklist
              <ArrowRight className="ml-2" size={16} />
            </button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">
            Product readiness checklist
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            We are tracking progress without diverting from the roadmap.
          </p>

          <div className="mt-5 space-y-3">
            {launchChecklist.map((item) => {
              const done = item.status === "Done";

              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <CircleDot size={18} className="text-yellow-300" />
                    )}

                    <p className="text-sm text-white">{item.title}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      done
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-yellow-400/10 text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <h2 className="text-base font-semibold text-white">
              Demo launch target
            </h2>

            <div className="mt-5 space-y-3">
              {[
                "Create one demo restaurant",
                "Record 30-second dashboard walkthrough",
                "Send demo to 20 food vendors",
                "Get first 3 pilot users",
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

          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Important reminder
            </h2>
            <p className="mt-2 text-sm leading-6 text-yellow-100">
              The UI is launch-ready visually, but real production still needs
              auth, database persistence, tenant/business separation, webhook
              security, and deployment configuration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
