"use client";

import { useActionState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createRecommendedPromoCampaigns } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";

const initialState = {
  success: "",
  error: "",
};

export function CreateRecommendedCampaignsButton() {
  const [state, formAction, pending] = useActionState(
    async () => {
      const result = await createRecommendedPromoCampaigns();

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
      <Button
        disabled={pending}
        variant="outline"
        className="h-10 rounded-full border-white/10 bg-white/[0.03] px-5 text-sm text-white hover:bg-white/10 disabled:opacity-60"
      >
        <Sparkles className="mr-2" size={16} />
        {pending ? "Creating..." : "Add campaign prompts"}
      </Button>
    </form>
  );
}
