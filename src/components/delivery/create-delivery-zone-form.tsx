"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { createDeliveryZone } from "@/actions/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreateDeliveryZoneForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await createDeliveryZone(formData);

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
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Truck size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Add delivery zone
          </h2>
          <p className="text-sm text-zinc-500">
            Example: Kubwa, Wuse, Gwarinpa.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Area</label>
          <Input
            name="area"
            required
            placeholder="Kubwa"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Delivery fee</label>
          <Input
            name="fee"
            required
            type="number"
            placeholder="1000"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Estimated time</label>
          <Input
            name="estimatedTime"
            placeholder="30 - 45 minutes"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          <Plus className="mr-2" size={16} />
          {pending ? "Saving..." : "Save delivery zone"}
        </Button>
      </div>
    </form>
  );
}
