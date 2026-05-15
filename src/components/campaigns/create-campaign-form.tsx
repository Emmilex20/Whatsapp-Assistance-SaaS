"use client";

import { useActionState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { createPromoCampaign } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateCampaignForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createPromoCampaign(formData);

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
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Megaphone size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Create campaign
          </h2>
          <p className="text-sm text-zinc-500">
            Plan a promo push for WhatsApp, Instagram, or flyers.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          name="title"
          required
          placeholder="Weekend Jollof Promo"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          name="goal"
          placeholder="Increase weekend orders"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="startDate"
            type="date"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
          />

          <Input
            name="endDate"
            type="date"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
          />
        </div>

        <textarea
          name="description"
          placeholder="Describe the offer, target audience, and what should be promoted..."
          className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create campaign"}
        </Button>
      </div>
    </form>
  );
}
