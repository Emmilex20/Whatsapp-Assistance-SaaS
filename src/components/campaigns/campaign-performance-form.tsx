"use client";

import { useActionState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { updateCampaignPerformance } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CampaignPerformanceFormProps = {
  campaign: {
    id: string;
    impressions: number;
    whatsappInquiries: number;
    ordersGenerated: number;
    revenueGenerated: number;
    performanceNotes: string | null;
  };
};

const initialState = { success: "", error: "" };

export function CampaignPerformanceForm({
  campaign,
}: CampaignPerformanceFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateCampaignPerformance(formData);

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
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <input type="hidden" name="id" value={campaign.id} />

      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <BarChart3 size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Performance tracking
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Enter campaign results manually after posting.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="impressions"
          type="number"
          min={0}
          defaultValue={campaign.impressions}
          placeholder="Impressions / views"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <Input
          name="whatsappInquiries"
          type="number"
          min={0}
          defaultValue={campaign.whatsappInquiries}
          placeholder="WhatsApp inquiries"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <Input
          name="ordersGenerated"
          type="number"
          min={0}
          defaultValue={campaign.ordersGenerated}
          placeholder="Orders generated"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <Input
          name="revenueGenerated"
          type="number"
          min={0}
          defaultValue={campaign.revenueGenerated}
          placeholder="Revenue generated"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <textarea
          name="performanceNotes"
          defaultValue={campaign.performanceNotes || ""}
          placeholder="What worked? What did customers ask? What should improve next time?"
          className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 md:col-span-2"
        />
      </div>

      <Button
        disabled={pending}
        className="mt-5 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save performance"}
      </Button>
    </form>
  );
}
