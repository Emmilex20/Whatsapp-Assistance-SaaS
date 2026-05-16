"use client";

import { useActionState, useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { createCustomerMemory } from "@/actions/customer-memory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateCustomerMemoryForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCustomerMemory(formData);

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
          <BrainCircuit size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Add memory</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Save a reusable customer preference for future AI context.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          name="customerPhone"
          required
          placeholder="2348012345678"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          name="key"
          required
          placeholder="Preferred delivery area"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <textarea
          name="value"
          required
          placeholder="Customer usually orders to Wuse 2 and prefers evening delivery."
          className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="confidence"
            type="number"
            min={0}
            max={100}
            defaultValue={80}
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
          />

          <select
            name="source"
            defaultValue="Manual"
            className="h-11 rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>Manual</option>
            <option>Inbox note</option>
            <option>Order note</option>
            <option>Staff observation</option>
            <option>Imported</option>
          </select>
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save memory"}
        </Button>
      </div>
    </form>
  );
}
