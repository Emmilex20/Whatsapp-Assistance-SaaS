import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { AIAutoReplyToggle } from "@/components/ai/ai-auto-reply-toggle";
import { AIUpsellToggle } from "@/components/ai/ai-upsell-toggle";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { requirePermission } from "@/lib/require-permission";

export default async function AISettingsPage() {
  await requirePermission("manage_ai");

  const restaurant = await getOrCreateCurrentRestaurant();

  const envStatus = [
    {
      key: "AI_PROVIDER",
      configured: Boolean(process.env.AI_PROVIDER),
      value: process.env.AI_PROVIDER || "openai",
    },
    {
      key: "OPENAI_API_KEY",
      configured: Boolean(process.env.OPENAI_API_KEY),
    },
    {
      key: "AI_RESPONSES_ENABLED",
      configured: Boolean(process.env.AI_RESPONSES_ENABLED),
      value: process.env.AI_RESPONSES_ENABLED || "false",
    },
    {
      key: "AI_UPSELLS_ENABLED",
      configured: Boolean(process.env.AI_UPSELLS_ENABLED),
      value: process.env.AI_UPSELLS_ENABLED || "false",
    },
    {
      key: "AI_MODEL",
      configured: Boolean(process.env.AI_MODEL),
      value: process.env.AI_MODEL || "gpt-5-mini",
    },
    {
      key: "REPLICATE_API_TOKEN",
      configured: Boolean(process.env.REPLICATE_API_TOKEN),
    },
    {
      key: "REPLICATE_TEXT_MODEL",
      configured: Boolean(process.env.REPLICATE_TEXT_MODEL),
      value: process.env.REPLICATE_TEXT_MODEL || "",
    },
    {
      key: "REPLICATE_TEXT_MODEL_PRIMARY",
      configured: Boolean(process.env.REPLICATE_TEXT_MODEL_PRIMARY),
      value:
        process.env.REPLICATE_TEXT_MODEL_PRIMARY ||
        "ibm-granite/granite-3.3-8b-instruct",
    },
    {
      key: "REPLICATE_TEXT_MODEL_FALLBACK",
      configured: Boolean(process.env.REPLICATE_TEXT_MODEL_FALLBACK),
      value:
        process.env.REPLICATE_TEXT_MODEL_FALLBACK || "openai/gpt-oss-20b",
    },
    {
      key: "REPLICATE_TEXT_MODEL_PREMIUM",
      configured: Boolean(process.env.REPLICATE_TEXT_MODEL_PREMIUM),
      value:
        process.env.REPLICATE_TEXT_MODEL_PREMIUM ||
        "qwen/qwen3-235b-a22b-instruct-2507",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">AI settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          AI response engine
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Control AI reply suggestions for restaurant staff. Auto-send is not
          enabled yet.
        </p>
      </section>

      {restaurant && (
        <AIAutoReplyToggle enabled={restaurant.aiAutoReplyEnabled} />
      )}

      {restaurant && (
        <AIUpsellToggle
          enabled={restaurant.aiUpsellsEnabled}
          envEnabled={process.env.AI_UPSELLS_ENABLED === "true"}
        />
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              AI usage and audit logs
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Track AI suggestions, auto-replies, blocked messages, tokens, and
              estimated cost.
            </p>
          </div>

          <Link
            href="/dashboard/settings/ai/usage"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            View AI usage
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              AI upsell rules
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Create short add-on suggestions for combos, drinks, sides, and
              repeat order opportunities.
            </p>
          </div>

          <Link
            href="/dashboard/ai/upsells"
            className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
          >
            Manage upsells
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <BrainCircuit size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">Safe AI mode</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Batch 60 only generates staff suggestions. It does not send AI
              messages directly to customers.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">AI provider</h2>

        <p className="mt-2 text-sm leading-6 text-blue-100">
          Current provider: {process.env.AI_PROVIDER || "openai"}. OpenAI is
          active now. If OpenAI fails, ServeFlow will try Replicate using the
          configured primary model first, then fallback models only if needed.
        </p>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Improve AI with knowledge base
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Add policies, payment rules, delivery instructions, and
              business-specific information for safer AI suggestions.
            </p>
          </div>

          <Link
            href="/dashboard/knowledge"
            className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Open knowledge base
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Preview AI context
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Check exactly what restaurant information AI will use before
              generating replies.
            </p>
          </div>

          <Link
            href="/dashboard/settings/ai/context"
            className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            View context
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          AI test messages
        </h2>

        <div className="mt-5 space-y-3">
          {[
            "Do you have Jollof Rice?",
            "How much is delivery to Kubwa?",
            "I want shawarma, how much?",
            "Where is my order?",
            "Can I pay by transfer?",
            "I received the wrong order and I want refund",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-blue-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Environment status
        </h2>

        <div className="mt-5 space-y-3">
          {envStatus.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <div>
                <code className="text-xs text-zinc-300">{item.key}</code>
                {item.value && (
                  <p className="mt-1 text-xs text-zinc-500">{item.value}</p>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                  item.configured
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {item.configured ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <CircleAlert size={13} />
                )}
                {item.configured ? "Set" : "Missing"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Cost safety rule
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Keep AI suggestions off until your restaurant data, menu, delivery
          zones, and automations are correct. AI uses tokens, so test with short
          conversations first.
        </p>
      </section>

      <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          AI cost protection
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-100">
          AI suggestions and auto-replies are limited by subscription plan. If
          a restaurant reaches its monthly AI event or token limit, AI will stop
          generating replies until the next month or until the plan is upgraded.
        </p>
      </section>
    </div>
  );
}
