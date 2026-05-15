import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Rocket } from "lucide-react";
import { CreateDemoDataButton } from "@/components/demo/create-demo-data-button";
import { ResetDemoDataButton } from "@/components/demo/reset-demo-data-button";
import { getEnvStatus } from "@/lib/env";

export default function LaunchPage() {
  const envStatus = getEnvStatus();
  const hasEnv = (key: string) =>
    envStatus.some((item) => item.key === key && item.configured);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const deployed =
    Boolean(process.env.VERCEL) ||
    Boolean(appUrl && !appUrl.includes("localhost"));
  const databaseAndAuthReady =
    hasEnv("DATABASE_URL") &&
    hasEnv("CLERK_SECRET_KEY") &&
    hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const whatsappReady =
    hasEnv("WHATSAPP_VERIFY_TOKEN") &&
    hasEnv("WHATSAPP_ACCESS_TOKEN") &&
    hasEnv("WHATSAPP_PHONE_NUMBER_ID") &&
    hasEnv("WHATSAPP_API_VERSION");
  const billingReady = hasEnv("PAYSTACK_SECRET_KEY");

  const launchReadinessItems = [
    {
      title: "Landing page completed",
      done: true,
      detail: "Public site, legal pages, contact page, and product sections exist.",
    },
    {
      title: "Dashboard shell completed",
      done: true,
      detail: "Core dashboard navigation, modules, and final check pages are in place.",
    },
    {
      title: "Restaurant onboarding completed",
      done: true,
      detail: "Onboarding now reads actual restaurant setup progress.",
    },
    {
      title: "Automation builder completed",
      done: true,
      detail: "Automation and FAQ setup pages are available.",
    },
    {
      title: "Inbox UI completed",
      done: true,
      detail: "Inbox, manual reply, assignment, and AI suggestion flows exist.",
    },
    {
      title: "Analytics UI completed",
      done: true,
      detail: "Dashboard analytics, operations reports, and archives are available.",
    },
    {
      title: "WhatsApp API foundation",
      done: whatsappReady,
      detail: whatsappReady
        ? "WhatsApp environment variables are configured."
        : "Add WhatsApp token, phone number ID, API version, and verify token.",
    },
    {
      title: "Billing foundation",
      done: billingReady,
      detail: billingReady
        ? "Paystack server key is configured."
        : "Add Paystack keys before enabling paid subscriptions.",
    },
    {
      title: "Database and auth connection",
      done: databaseAndAuthReady,
      detail: databaseAndAuthReady
        ? "Database and Clerk authentication environment variables are configured."
        : "Configure DATABASE_URL and Clerk keys.",
    },
    {
      title: "Deploy to Vercel",
      done: deployed,
      detail: deployed
        ? "A live app URL or Vercel environment was detected."
        : "Deploy and set NEXT_PUBLIC_APP_URL to the live domain.",
    },
  ];

  const completedCount = launchReadinessItems.filter((item) => item.done).length;
  const launchReady = completedCount === launchReadinessItems.length;

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

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-100">
            {completedCount}/{launchReadinessItems.length} launch checks ready
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs ${
              launchReady
                ? "bg-emerald-400/10 text-emerald-200"
                : "bg-yellow-400/10 text-yellow-200"
            }`}
          >
            {launchReady ? "Launch foundation ready" : "Configuration pending"}
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Create demo data
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Instantly add demo menu items, delivery zones, automations,
              customer chats, and orders to your current account.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <CreateDemoDataButton />
            <ResetDemoDataButton />
          </div>
        </div>
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

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Pre-launch QA checklist
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Use QA_CHECKLIST.md to test the full product before onboarding real
          restaurants.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Pilot onboarding target
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Before public launch, onboard 3 restaurants manually. Use the Pilots
          page to track contact, setup, testing, and active usage.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Outreach and demo sharing
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Use the Outreach page to copy simple messages and share the public
          demo page with restaurants you want to onboard.
        </p>
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
            {launchReadinessItems.map((item) => {
              return (
                <div
                  key={item.title}
                  className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
                    item.done
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "border-yellow-400/20 bg-yellow-400/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <CircleDot size={18} className="text-yellow-300" />
                    )}

                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                      item.done
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-yellow-400/10 text-yellow-300"
                    }`}
                  >
                    {item.done ? "Done" : "Next"}
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
              {launchReady
                ? "The foundation checks look ready. Before real customers depend on it, still complete the pilot checklist, monitor first messages, and keep AI auto-reply disabled until owner approval."
                : "Some production checks are still pending. Finish the missing environment, WhatsApp, billing, and deployment items before onboarding a real restaurant."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
