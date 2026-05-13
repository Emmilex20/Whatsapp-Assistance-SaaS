import { MessageSquareText, Send } from "lucide-react";
import { OutreachGenerator } from "@/components/outreach/outreach-generator";
import { CopyButton } from "@/components/shared/copy-button";
import { outreachScripts } from "@/lib/site";

export default function OutreachPage() {
  const demoLink = "/demo";
  const demoUrl = `https://serveflow-taupe.vercel.app${demoLink}`;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Client outreach
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Scripts for getting pilot restaurants
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Use these short messages to contact restaurants, food vendors,
          shawarma spots, and small food businesses without needing long sales
          calls.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <Send size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Demo link to share
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Send this link to prospects after deploying:
            </p>

            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
              <code className="text-sm text-zinc-300">{demoUrl}</code>

              <CopyButton value={demoUrl} label="Copy link" />
            </div>
          </div>
        </div>
      </section>

      <OutreachGenerator />

      <section className="grid gap-4">
        {outreachScripts.map((script) => (
          <div
            key={script.title}
            className="rounded-3xl border border-white/10 bg-white/3 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquareText size={17} className="text-emerald-400" />
                  <h2 className="text-base font-semibold text-white">
                    {script.title}
                  </h2>
                </div>

                <p className="mt-1 text-xs text-zinc-500">{script.channel}</p>
              </div>

              <CopyButton value={script.message} />
            </div>

            <p className="mt-4 whitespace-pre-line rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm leading-6 text-zinc-300">
              {script.message}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Simple outreach target
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Contact 10 restaurants or food vendors per day. Your first goal is not
          popularity. It is 3 serious pilot businesses willing to test the
          system.
        </p>
      </section>
    </div>
  );
}
