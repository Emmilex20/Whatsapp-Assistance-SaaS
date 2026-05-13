"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createFAQ } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { success: "", error: "" };

export function CreateFAQForm() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await createFAQ(formData);

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
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <h2 className="text-base font-semibold text-white">New FAQ</h2>
      <p className="mt-1 text-sm text-zinc-500">
        These answers will later connect to automation rules.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Question</label>
          <Input
            name="question"
            required
            placeholder="Do you deliver?"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Answer</label>
          <Input
            name="answer"
            required
            placeholder="Yes, we deliver within selected areas."
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save FAQ"}
        </Button>
      </div>
    </form>
  );
}
