"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { toggleCampaignPostPosted } from "@/actions/campaign-posts";
import { Button } from "@/components/ui/button";

type TogglePostedButtonProps = {
  id: string;
  posted: boolean;
};

const initialState = { success: "", error: "" };

export function TogglePostedButton({ id, posted }: TogglePostedButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await toggleCampaignPostPosted(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />

      {!posted && (
        <textarea
          name="completionNotes"
          placeholder="Optional note: Posted to WhatsApp status with caption pack..."
          className="min-h-16 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600"
        />
      )}

      <Button
        disabled={pending}
        variant="outline"
        className={`h-9 rounded-full px-4 text-xs ${
          posted
            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
        }`}
      >
        <CheckCircle2 className="mr-2" size={14} />
        {posted ? "Mark not posted" : "Mark posted"}
      </Button>
    </form>
  );
}
