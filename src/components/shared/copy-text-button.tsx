"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyTextButtonProps = {
  value: string;
  label?: string;
};

export function CopyTextButton({
  value,
  label = "Copy",
}: CopyTextButtonProps) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toast.success("Copied.");
  }

  return (
    <Button
      type="button"
      onClick={copy}
      variant="outline"
      className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
    >
      <Copy className="mr-2" size={14} />
      {label}
    </Button>
  );
}
