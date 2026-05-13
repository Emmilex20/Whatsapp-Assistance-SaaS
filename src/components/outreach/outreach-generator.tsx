"use client";

import { useMemo, useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OutreachGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("restaurant");
  const [painPoint, setPainPoint] = useState(
    "replying late to WhatsApp customers"
  );
  const [generated, setGenerated] = useState("");

  const defaultMessage = useMemo(() => {
    const name = businessName.trim() || "your business";
    const type = businessType.trim() || "food business";
    const pain = painPoint.trim() || "handling WhatsApp customer messages";

    return `Hi, I noticed ${name} is a ${type} that likely handles customer questions and orders on WhatsApp.

I'm building ServeFlow, a WhatsApp assistant for restaurants and food vendors. It can help with ${pain} by automatically replying to menu, delivery, price, and order questions.

I made a quick demo and I'd love to show you how it could work for ${name}.`;
  }, [businessName, businessType, painPoint]);

  function generateMessage() {
    setGenerated(defaultMessage);
  }

  const messageToCopy = generated || defaultMessage;

  return (
    <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Personalized outreach generator
          </h2>
          <p className="text-sm text-zinc-300">
            Fill a few details and copy a tailored message.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-zinc-200">Business name</label>
          <Input
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Mama T's Kitchen"
            className="h-11 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-200">Business type</label>
          <Input
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            placeholder="restaurant"
            className="h-11 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-200">Pain point</label>
          <Input
            value={painPoint}
            onChange={(event) => setPainPoint(event.target.value)}
            placeholder="replying late to customers"
            className="h-11 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={generateMessage}
          className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200"
        >
          <MessageSquareText className="mr-2" size={16} />
          Generate message
        </Button>

        <CopyButton value={messageToCopy} label="Copy generated message" />
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-zinc-950/50 p-4">
        <p className="whitespace-pre-line text-sm leading-6 text-zinc-200">
          {messageToCopy}
        </p>
      </div>
    </section>
  );
}
