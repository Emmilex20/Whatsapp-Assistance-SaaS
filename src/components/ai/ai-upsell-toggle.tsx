"use client";

import { useActionState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { updateAIUpsellSetting } from "@/actions/ai-settings";
import { Button } from "@/components/ui/button";

type AIUpsellToggleProps = {
  enabled: boolean;
  envEnabled: boolean;
};

const initialState = {
  success: "",
  error: "",
};

export function AIUpsellToggle({
  enabled,
  envEnabled,
}: AIUpsellToggleProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateAIUpsellSetting(formData);

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
      className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5"
    >
      <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShoppingBag size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              AI upsell suggestions
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Current status:{" "}
              <span className="font-semibold">
                {enabled && envEnabled ? "Enabled" : "Disabled"}
              </span>
              . Environment gate:{" "}
              <span className="font-semibold">
                {envEnabled ? "AI_UPSELLS_ENABLED=true" : "Disabled"}
              </span>
              .
            </p>
          </div>
        </div>

        <Button
          disabled={pending}
          className={`h-10 rounded-full px-5 text-sm ${
            enabled
              ? "bg-red-500 text-white hover:bg-red-400"
              : "bg-white text-zinc-950 hover:bg-zinc-200"
          } disabled:opacity-60`}
        >
          {pending
            ? "Saving..."
            : enabled
              ? "Disable upsells"
              : "Enable upsells"}
        </Button>
      </div>
    </form>
  );
}
