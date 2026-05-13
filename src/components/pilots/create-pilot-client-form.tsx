"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createPilotClient } from "@/actions/pilot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function CreatePilotClientForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createPilotClient(formData);

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
      <h2 className="text-base font-semibold text-white">Add pilot client</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Track restaurants you want to onboard manually.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Business name</label>
          <Input
            name="businessName"
            required
            placeholder="Mama T's Kitchen"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Contact name</label>
          <Input
            name="contactName"
            placeholder="Amaka"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Phone / WhatsApp</label>
          <Input
            name="phone"
            required
            placeholder="+2348012345678"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="owner@example.com"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Instagram</label>
          <Input
            name="instagram"
            placeholder="@restaurant_handle"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Business type</label>
          <Input
            name="businessType"
            placeholder="Restaurant, food vendor, shawarma spot..."
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-300">Location</label>
          <Input
            name="location"
            placeholder="Kubwa, Abuja"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-300">Internal notes</label>
          <textarea
            name="notes"
            placeholder="Owner gets many WhatsApp orders but replies late..."
            className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
          />
        </div>
      </div>

      <Button
        disabled={pending}
        className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add pilot client"}
      </Button>
    </form>
  );
}
