"use client";

import { useActionState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createCampaignCaptionPack } from "@/actions/campaign-caption-packs";
import { Button } from "@/components/ui/button";

type GenerateCaptionPackButtonProps = {
  campaignId: string;
};

const initialState = {
  success: "",
  error: "",
};

export function GenerateCaptionPackButton({
  campaignId,
}: GenerateCaptionPackButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCampaignCaptionPack(formData);

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
    <form action={formAction}>
      <input type="hidden" name="campaignId" value={campaignId} />

      <Button
        disabled={pending}
        className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <Sparkles className="mr-2" size={16} />
        {pending ? "Generating..." : "Generate caption pack"}
      </Button>
    </form>
  );
}
