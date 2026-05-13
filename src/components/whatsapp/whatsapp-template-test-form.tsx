"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WhatsAppTemplateTestForm() {
  const [to, setTo] = useState("");
  const [templateName, setTemplateName] = useState("order_confirmed");
  const [languageCode, setLanguageCode] = useState("en");
  const [parameters, setParameters] = useState(
    "Amaka, A1B2C3, Mama T's Kitchen, NGN 4,500"
  );
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    try {
      setLoading(true);

      const response = await fetch("/api/whatsapp/test-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          templateName,
          languageCode,
          parameters: parameters
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Template send failed.");
        return;
      }

      if (data.result?.skipped) {
        toast.info("Template send skipped because WHATSAPP_SEND_ENABLED=false.");
      } else if (data.result?.error) {
        toast.error(data.result.error);
      } else {
        toast.success("Template message sent.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-base font-semibold text-white">
        Test template message
      </h2>
      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Use only approved template names from Meta WhatsApp Manager.
      </p>

      <div className="mt-5 space-y-4">
        <Input
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="2348012345678"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="order_confirmed"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          value={languageCode}
          onChange={(event) => setLanguageCode(event.target.value)}
          placeholder="en"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <textarea
          value={parameters}
          onChange={(event) => setParameters(event.target.value)}
          className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none"
          placeholder="Comma-separated body variables"
        />

        <Button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          <Send className="mr-2" size={16} />
          {loading ? "Sending..." : "Send template test"}
        </Button>
      </div>
    </div>
  );
}
