import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot } from "lucide-react";
import { firstTimeSetupGuide } from "@/lib/site";

type SetupGuideProps = {
  completed?: string[];
};

export function SetupGuide({ completed = [] }: SetupGuideProps) {
  const complete = completed.length >= firstTimeSetupGuide.length;

  return (
    <div
      className={`rounded-3xl border p-5 ${
        complete
          ? "border-emerald-400/20 bg-emerald-400/10"
          : "border-white/10 bg-white/3"
      }`}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">
          {complete ? "Setup guide completed" : "First-time setup guide"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          {complete
            ? "Your core Business assistant setup is complete. You can now test WhatsApp, review AI safety, and prepare for launch."
            : "Follow these steps to prepare the assistant for real business customers."}
        </p>
      </div>

      <div className="space-y-3">
        {firstTimeSetupGuide.map((step) => {
          const done = completed.includes(step.title);

          return (
            <Link
              href={step.href}
              key={step.title}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
            >
              <div className="flex gap-3">
                {done ? (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 text-emerald-400"
                  />
                ) : (
                  <CircleDot size={18} className="mt-0.5 text-yellow-300" />
                )}

                <div>
                  <p className="text-sm font-medium text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {step.description}
                  </p>
                </div>
              </div>

              <ArrowRight size={16} className="mt-1 shrink-0 text-zinc-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
