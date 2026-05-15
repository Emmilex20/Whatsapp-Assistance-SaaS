"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ReusePromptButtonProps = {
  prompt: string;
};

export function ReusePromptButton({ prompt }: ReusePromptButtonProps) {
  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied. Paste it into the promo idea box.");
  }

  return (
    <Button
      type="button"
      onClick={copyPrompt}
      variant="outline"
      className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
    >
      <Copy className="mr-2" size={14} />
      Reuse prompt
    </Button>
  );
}
