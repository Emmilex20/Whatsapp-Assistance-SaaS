"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  planId: string;
  label: string;
};

export function CheckoutButton({ planId, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const email = window.prompt("Enter customer email for billing:");

      if (!email) {
        return;
      }

      const response = await fetch("/api/billing/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to start checkout.");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error(error);
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-6 h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
    >
      {loading ? "Starting checkout..." : label}
    </Button>
  );
}
