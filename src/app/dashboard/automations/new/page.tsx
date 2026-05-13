import Link from "next/link";
import { ArrowLeft, Bot, MessageSquareText, Workflow } from "lucide-react";
import { CreateAutomationForm } from "@/components/automations/create-automation-form";

export default function NewAutomationPage() {
  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/automations"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to automations
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          New automation rule
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Create a WhatsApp auto-reply
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Define what customers can type and what your assistant should reply
          with automatically.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <CreateAutomationForm />

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <h2 className="text-base font-semibold text-white">
              Workflow preview
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              This is how the rule logic works.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                    <MessageSquareText size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Customer sends message
                    </p>
                    <p className="text-xs text-zinc-500">
                      Example: Please send menu
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-4 h-6 border-l border-dashed border-white/20" />

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Workflow size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Trigger is detected
                    </p>
                    <p className="text-xs text-zinc-500">
                      System checks keywords like menu, food, price.
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-4 h-6 border-l border-dashed border-white/20" />

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <Bot size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Assistant replies automatically
                    </p>
                    <p className="text-xs text-zinc-500">
                      Customer receives your saved reply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Beginner rule tip
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Start with only 3 rules: menu, delivery, and order. These solve
              the most common restaurant WhatsApp questions without making the
              system complicated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
