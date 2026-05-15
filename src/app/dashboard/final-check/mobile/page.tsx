import { Smartphone } from "lucide-react";

const checks = [
  "No dashboard page has horizontal overflow on mobile.",
  "All filter rows scroll horizontally when needed.",
  "Cards stack cleanly on small screens.",
  "Headings are not oversized at 100% browser zoom.",
  "Buttons do not squeeze into unreadable text.",
  "Media gallery images remain square and clean.",
  "Long prompts, emails, URLs, and captions wrap correctly.",
  "Forms use full width on mobile.",
  "Tables or dense rows have horizontal scroll wrappers.",
  "Inbox reply area has enough bottom spacing on mobile.",
];

export default function MobileAuditPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Mobile audit</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Responsiveness checklist
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Use this page to audit the dashboard before pilot launch.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <Smartphone size={18} className="mt-0.5 text-emerald-400" />

              <p className="text-sm leading-6 text-zinc-300">{check}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
