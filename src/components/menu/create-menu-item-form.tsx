"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createMenuItem } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateMenuItemForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await createMenuItem(formData);

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
      formRef.current?.reset();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/3 p-5"
    >
      <h2 className="text-base font-semibold text-white">Add new item</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Saved items will later be used by WhatsApp automations.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Food name</label>
          <Input
            name="name"
            required
            placeholder="Jollof Rice & Chicken"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Category</label>
          <Input
            name="category"
            placeholder="Rice"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Price in naira</label>
          <Input
            name="price"
            required
            type="number"
            placeholder="3500"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-white text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save item"}
        </Button>
      </div>
    </form>
  );
}
