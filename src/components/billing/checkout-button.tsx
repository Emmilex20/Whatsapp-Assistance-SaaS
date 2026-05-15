"use client";

import { FormEvent, useState } from "react";
import { CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type CheckoutButtonProps = {
  planId: string;
  label: string;
  disabled?: boolean;
};

export function CheckoutButton({
  planId,
  label,
  disabled = false,
}: CheckoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter the customer billing email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/billing/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to start checkout.");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (checkoutError) {
      console.error(checkoutError);
      setError("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || loading}
          className="mt-6 h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          {loading ? "Starting checkout..." : label}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-3xl border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl shadow-black/50 sm:max-w-lg">
        <form onSubmit={handleCheckout}>
          <div className="p-5 sm:p-6">
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <CreditCard size={20} />
              </div>

              <DialogTitle className="text-xl font-semibold text-white">
                Start Paystack checkout
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-zinc-400">
                Enter the customer billing email. Paystack will handle the
                secure payment page, and billing history will update after
                callback or webhook verification.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Billing email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@restaurant.com"
                  className="h-11 rounded-2xl border-white/10 bg-zinc-900 pl-9 text-sm text-white placeholder:text-zinc-600"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm leading-6 text-red-200">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-full border-white/10 bg-white/[0.03] px-5 text-sm text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Starting..." : "Continue to Paystack"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
