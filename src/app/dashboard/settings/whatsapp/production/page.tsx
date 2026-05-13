import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";

const envItems = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_SEND_ENABLED",
  "NEXT_PUBLIC_APP_URL",
];

export default function WhatsAppProductionPage() {
  const status = envItems.map((key) => ({
    key,
    configured: Boolean(process.env[key]),
  }));

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/settings/whatsapp"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to WhatsApp settings
        </Link>

        <p className="text-sm font-medium text-emerald-400">
          WhatsApp production setup
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Connect real WhatsApp Cloud API
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Use this checklist when connecting ServeFlow to a real Meta WhatsApp
          Business number.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Required environment variables
          </h2>

          <div className="mt-5 space-y-3">
            {status.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <code className="text-xs text-zinc-300">{item.key}</code>

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
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Meta setup steps
          </h2>

          <div className="mt-5 space-y-3">
            {[
              "Create or open your Meta developer app.",
              "Add the WhatsApp product.",
              "Copy your Phone Number ID from WhatsApp API Setup.",
              "Generate or attach a permanent access token.",
              "Set your callback URL to https://your-domain.com/api/webhooks/whatsapp.",
              "Use your WHATSAPP_VERIFY_TOKEN as the verify token.",
              "Subscribe to messages webhook events.",
              "Send a real test message to your WhatsApp number.",
              "Keep WHATSAPP_SEND_ENABLED=false until incoming webhook works.",
              "After successful tests, set WHATSAPP_SEND_ENABLED=true.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm leading-6 text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Important production note
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Free-form service messages can only be sent within WhatsApp&apos;s
          customer service window after a customer messages the business.
          Outside that window, you&apos;ll need approved message templates.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Recommended Meta templates
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Create these in Meta WhatsApp Manager before testing outbound messages
          outside the customer service window.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {[
            {
              name: "order_confirmed",
              category: "Utility",
              body: "Hello {{1}}, your order #{{2}} from {{3}} has been confirmed. Total: {{4}}. We will update you shortly.",
            },
            {
              name: "order_ready",
              category: "Utility",
              body: "Hello {{1}}, your order #{{2}} is ready. It will be sent out for delivery or prepared for pickup shortly.",
            },
            {
              name: "order_delivered",
              category: "Utility",
              body: "Hello {{1}}, your order #{{2}} has been delivered. Thank you for ordering from {{3}}.",
            },
            {
              name: "follow_up_demo",
              category: "Marketing or Utility",
              body: "Hi {{1}}, thanks for checking out ServeFlow. Would you like us to help set up your WhatsApp restaurant assistant this week?",
            },
          ].map((template) => (
            <div
              key={template.name}
              className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-sm text-white">{template.name}</code>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {template.category}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {template.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Real customer testing checklist
        </h2>

        <div className="mt-5 space-y-3">
          {[
            "Set WHATSAPP_SEND_ENABLED=false first.",
            "Send a message from your personal WhatsApp to the business number.",
            "Confirm the conversation appears in Inbox.",
            "Confirm menu request returns saved menu.",
            "Confirm delivery question returns saved zone fee.",
            "Confirm order message creates an order.",
            "Confirm address message updates delivery fee and order total.",
            "Then set WHATSAPP_SEND_ENABLED=true.",
            "Repeat the flow with one trusted test customer.",
            "Only after that, onboard a real pilot restaurant.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
