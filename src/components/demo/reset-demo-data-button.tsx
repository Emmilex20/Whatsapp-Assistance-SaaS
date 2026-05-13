"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { resetDemoDataForCurrentUser } from "@/actions/demo";
import { Button } from "@/components/ui/button";

const initialState = {
  success: "",
  error: "",
};

export function ResetDemoDataButton() {
  const [state, formAction, pending] = useActionState(
    async () => {
      const confirmed = window.confirm(
        "Reset demo data? This only removes records marked as demo."
      );

      if (!confirmed) {
        return { success: "", error: "" };
      }

      const result = await resetDemoDataForCurrentUser();

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      window.location.reload();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Button
        disabled={pending}
        variant="outline"
        className="h-10 rounded-full border-red-400/20 bg-red-400/10 px-5 text-sm text-red-300 hover:bg-red-400/20 disabled:opacity-60"
      >
        <Trash2 className="mr-2" size={16} />
        {pending ? "Resetting..." : "Reset demo data"}
      </Button>
    </form>
  );
}
