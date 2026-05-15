"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { attachMediaToCampaign } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";

type AttachToCampaignFormProps = {
  mediaId: string;
  campaigns: {
    id: string;
    title: string;
  }[];
};

const initialState = {
  success: "",
  error: "",
};

export function AttachToCampaignForm({
  mediaId,
  campaigns,
}: AttachToCampaignFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await attachMediaToCampaign(formData);

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

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />

      <select
        name="campaignId"
        className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-zinc-950 px-3 text-xs text-white outline-none"
      >
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.title}
          </option>
        ))}
      </select>

      <Button
        disabled={pending}
        variant="outline"
        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
      >
        {pending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
