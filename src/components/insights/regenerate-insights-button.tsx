"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { regenerateBusinessInsights } from "@/actions/business-insights";
import { Button } from "@/components/ui/button";

type RegenerateInsightsButtonProps = {
  period: "WEEKLY" | "MONTHLY";
};

const initialState = {
  success: "",
  error: "",
};

export function RegenerateInsightsButton({
  period,
}: RegenerateInsightsButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await regenerateBusinessInsights(formData);

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
      <input type="hidden" name="period" value={period} />

      <Button
        disabled={pending}
        className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <RefreshCw className="mr-2" size={16} />
        {pending ? "Generating..." : "Regenerate insights"}
      </Button>
    </form>
  );
}
