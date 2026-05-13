"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createDemoDataForCurrentUser } from "@/actions/demo";
import { Button } from "@/components/ui/button";

const initialState = {
  success: "",
  error: "",
};

export function CreateDemoDataButton() {
  const [state, formAction, pending] = useActionState(
    async () => {
      const result = await createDemoDataForCurrentUser();

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
        className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
      >
        <Sparkles className="mr-2" size={16} />
        {pending ? "Creating demo..." : "Create demo data"}
      </Button>
    </form>
  );
}
