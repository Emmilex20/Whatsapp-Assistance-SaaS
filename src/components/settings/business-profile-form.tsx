"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateRestaurantProfile } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BusinessProfileFormProps = {
  restaurant: {
    name: string;
    whatsappNumber: string | null;
    whatsappPhoneNumberId: string | null;
    address: string | null;
    openingTime: string | null;
    closingTime: string | null;
  };
};

const initialState = { success: "", error: "" };

export function BusinessProfileForm({ restaurant }: BusinessProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await updateRestaurantProfile(formData);

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
      <h2 className="text-base font-semibold text-white">Basic information</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Add your restaurant name, WhatsApp number, and location.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Restaurant name</label>
          <Input
            name="name"
            defaultValue={restaurant.name || ""}
            placeholder="Mama T's Kitchen"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">WhatsApp number</label>
          <Input
            name="whatsappNumber"
            defaultValue={restaurant.whatsappNumber || ""}
            placeholder="+234 801 234 5678"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">
            WhatsApp Phone Number ID
          </label>
          <Input
            name="whatsappPhoneNumberId"
            defaultValue={restaurant.whatsappPhoneNumberId || ""}
            placeholder="123456789012345"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
          <p className="text-xs leading-5 text-zinc-500">
            This comes from Meta WhatsApp Cloud API setup.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Restaurant address</label>
          <Input
            name="address"
            defaultValue={restaurant.address || ""}
            placeholder="Kubwa, Abuja, Nigeria"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Opening time</label>
          <Input
            name="openingTime"
            defaultValue={restaurant.openingTime || ""}
            placeholder="9:00 AM"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Closing time</label>
          <Input
            name="closingTime"
            defaultValue={restaurant.closingTime || ""}
            placeholder="9:00 PM"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <Button
        disabled={pending}
        className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save business profile"}
      </Button>
    </form>
  );
}
