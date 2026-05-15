"use client";

import { useActionState, useEffect } from "react";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { updateBrandKit } from "@/actions/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BrandKitFormProps = {
  restaurant: {
    brandPrimaryColor: string | null;
    brandSecondaryColor: string | null;
    brandSlogan: string | null;
    brandTone: string | null;
    brandLogoUrl: string | null;
    brandVisualStyle: string | null;
  };
};

const initialState = {
  success: "",
  error: "",
};

export function BrandKitForm({ restaurant }: BrandKitFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateBrandKit(formData);

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
          <Palette size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Brand identity
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            These details help ServeFlow create more consistent promo assets.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Primary color</label>
          <Input
            name="brandPrimaryColor"
            defaultValue={restaurant.brandPrimaryColor || ""}
            placeholder="#16a34a"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Secondary color</label>
          <Input
            name="brandSecondaryColor"
            defaultValue={restaurant.brandSecondaryColor || ""}
            placeholder="#facc15"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-300">Brand slogan</label>
          <Input
            name="brandSlogan"
            defaultValue={restaurant.brandSlogan || ""}
            placeholder="Delicious meals, delivered fast."
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Brand tone</label>
          <select
            name="brandTone"
            defaultValue={restaurant.brandTone || "Warm and friendly"}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>Warm and friendly</option>
            <option>Premium and elegant</option>
            <option>Youthful and playful</option>
            <option>Bold and energetic</option>
            <option>Simple and professional</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Visual style</label>
          <select
            name="brandVisualStyle"
            defaultValue={restaurant.brandVisualStyle || "Modern food advert"}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>Modern food advert</option>
            <option>Luxury restaurant style</option>
            <option>Street food vibrant style</option>
            <option>Clean minimalist style</option>
            <option>Afro-fusion premium style</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-300">Logo URL</label>
          <Input
            name="brandLogoUrl"
            defaultValue={restaurant.brandLogoUrl || ""}
            placeholder="https://..."
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
          <p className="text-xs leading-5 text-zinc-500">
            Paste an existing logo URL, or upload a logo below.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-300">Upload logo</label>
          <input
            name="brandLogoFile"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-400"
          />
          <p className="text-xs leading-5 text-zinc-500">
            Uploading a file replaces the logo URL with the uploaded image path.
            Maximum size is 2MB.
          </p>
        </div>
      </div>

      <Button
        disabled={pending}
        className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save brand kit"}
      </Button>
    </form>
  );
}
