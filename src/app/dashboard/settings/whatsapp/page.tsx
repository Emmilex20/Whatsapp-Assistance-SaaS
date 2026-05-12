import { CheckCircle2, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whatsappSetupSteps } from "@/lib/site";

export default function WhatsAppSettingsPage() {
  const callbackUrl = "https://your-domain.com/api/webhooks/whatsapp";

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          WhatsApp integration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Connect WhatsApp Cloud API
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Add your Meta WhatsApp credentials and connect your webhook endpoint.
          This is the bridge between customer WhatsApp messages and ServeFlow.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">
            Webhook configuration
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Use these values in your Meta WhatsApp configuration page.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Callback URL</label>
              <div className="flex gap-2">
                <Input
                  value={callbackUrl}
                  readOnly
                  className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-2xl border-white/10 bg-white/3 text-white hover:bg-white/10"
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Verify token</label>
              <Input
                value="Use value from WHATSAPP_VERIFY_TOKEN"
                readOnly
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-zinc-400"
              />
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
              <p className="text-sm leading-6 text-yellow-100">
                Never paste your WhatsApp access token inside frontend code.
                Keep it only inside <span className="font-semibold">.env.local</span>.
              </p>
            </div>

            <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
              Save WhatsApp setup
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Setup checklist
              </h2>
              <p className="text-sm text-zinc-500">
                Follow this order inside Meta.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {whatsappSetupSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-5 h-10 w-full rounded-full border-white/10 bg-white/3 text-sm text-white hover:bg-white/10"
          >
            Open Meta dashboard
            <ExternalLink className="ml-2" size={15} />
          </Button>
        </div>
      </section>
    </div>
  );
}