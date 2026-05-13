"use client";

import { useActionState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createKnowledgeBaseItem } from "@/actions/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateKnowledgeForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createKnowledgeBaseItem(formData);

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
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <BookOpen size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Add knowledge</h2>
          <p className="text-sm text-zinc-500">
            Add business facts the AI should know.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          name="title"
          required
          placeholder="Refund policy"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          name="category"
          placeholder="Policy, delivery, payment, operations..."
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <textarea
          name="content"
          required
          placeholder="Example: We only accept refunds if the order has not entered preparation..."
          className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save knowledge"}
        </Button>
      </div>
    </form>
  );
}
