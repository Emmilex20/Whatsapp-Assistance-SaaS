"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAutomation } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateAutomationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await createAutomation(formData);

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
      router.push("/dashboard/automations");
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, router]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <h2 className="text-base font-semibold text-white">
        Automation details
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Keep the trigger simple so customers can activate it easily.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Automation name</label>
          <Input
            name="name"
            required
            placeholder="Menu request"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            Customer trigger keywords
          </label>
          <Input
            name="triggers"
            required
            placeholder="menu, food, price"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
          <p className="text-xs leading-5 text-zinc-500">
            Separate keywords with commas. Example: menu, food, price list.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Assistant reply</label>
          <textarea
            name="response"
            required
            placeholder="Sure, here is today's menu with prices..."
            className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
          />
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save automation"}
        </Button>
      </div>
    </form>
  );
}
