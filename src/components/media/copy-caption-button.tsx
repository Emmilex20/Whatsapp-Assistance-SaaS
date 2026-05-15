"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyCaptionButtonProps = {
  caption: string;
};

export function CopyCaptionButton({ caption }: CopyCaptionButtonProps) {
  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    toast.success("Caption copied.");
  }

  return (
    <Button
      type="button"
      onClick={copyCaption}
      variant="outline"
      className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
    >
      <Copy className="mr-2" size={14} />
      Copy caption
    </Button>
  );
}
