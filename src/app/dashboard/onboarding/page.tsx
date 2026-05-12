import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onboardingSteps } from "@/lib/site";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-400">Restaurant setup</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Set up your WhatsApp restaurant assistant
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Add the important business details your assistant will use to answer customers correctly.
          </p>
        </div>

        <div className="mt-6">
          <Link href="/dashboard/settings/business">
            <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
              Start setup
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {onboardingSteps.map((step, index) => {
          const active = index === 0;

          return (
            <div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  {active ? <CheckCircle2 size={19} /> : <Circle size={18} />}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    active
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {step.status}
                </span>
              </div>

              <h2 className="text-base font-semibold text-white">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {step.description}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}