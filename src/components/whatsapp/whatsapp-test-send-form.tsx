"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WhatsAppTestSendForm() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState(
    "Hello from ServeFlow. This is a WhatsApp test message."
  );
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    try {
      setLoading(true);

      const response = await fetch("/api/whatsapp/test-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Test send failed.");
        return;
      }

      if (data.result?.skipped) {
        toast.info("Send skipped because WHATSAPP_SEND_ENABLED=false.");
      } else if (data.result?.error) {
        toast.error(data.result.error);
      } else {
        toast.success("WhatsApp test message sent.");
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
        Test WhatsApp sending
      </h2>

      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Use this only after your Meta token and phone number ID are configured.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Recipient phone number
          </label>
          <Input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="2348012345678"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
          <p className="text-xs text-zinc-500">
            Use international format without +. Example: 2348012345678.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Message</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none"
          />
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          <Send className="mr-2" size={16} />
          {loading ? "Sending..." : "Send test message"}
        </Button>
      </div>
    </div>
  );
}
