"use client";

import { useActionState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createUpsellRule } from "@/actions/upsells";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateUpsellRuleForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createUpsellRule(formData);

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
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Create upsell rule
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Suggest a useful add-on when a customer asks for a matching item.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          name="triggerItem"
          required
          placeholder="Jollof rice"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          name="suggestedItem"
          required
          placeholder="Chicken and chilled Coke"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <textarea
          name="message"
          required
          placeholder="Would you like to add chicken and a chilled Coke to make it a combo?"
          className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create upsell rule"}
        </Button>
      </div>
    </form>
  );
}
