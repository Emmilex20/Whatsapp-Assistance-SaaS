"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createRecommendedKnowledgeBaseItems } from "@/actions/knowledge";
import { Button } from "@/components/ui/button";

const initialState = { success: "", error: "" };

export function CreateRecommendedKnowledgeButton() {
  const [state, formAction, pending] = useActionState(async () => {
    const result = await createRecommendedKnowledgeBaseItems();

    return {
      success: result?.success || "",
      error: result?.error || "",
    };
  }, initialState);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <Button
        disabled={pending}
        className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <Sparkles className="mr-2" size={16} />
        {pending ? "Creating..." : "Save recommended knowledge"}
      </Button>
    </form>
  );
}
