"use client";

import { useActionState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { createPromoImage } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { mediaPromptTemplates } from "@/lib/media/templates";

const initialState = {
  success: "",
  error: "",
  outputUrl: "",
  skipped: false,
};

export function CreatePromoImageForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createPromoImage(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
        outputUrl: result?.outputUrl || "",
        skipped: Boolean(result?.skipped),
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success && !state.skipped) toast.success(state.success);
    if (state.skipped) toast.info("Media generation is disabled.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <h2 className="text-base font-semibold text-white">
        Generate promo image
      </h2>

      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Create social media promo images for restaurants using Replicate.
      </p>

      <div className="mt-5 space-y-2">
        <label className="text-sm text-zinc-300">Choose template</label>

        <select
          name="templateType"
          defaultValue="weekend_promo"
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-emerald-400/50"
        >
          {mediaPromptTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>

        <p className="text-xs leading-5 text-zinc-500">
          Pick a promo type, then add your specific offer below.
        </p>
      </div>

      <textarea
        name="idea"
        required
        placeholder="Example: Buy 2 plates of jollof rice and get free drink this weekend..."
        className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
      />

      <Button
        disabled={pending}
        className="mt-4 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <ImagePlus className="mr-2" size={16} />
        {pending ? "Generating..." : "Generate image"}
      </Button>

      {state.outputUrl && (
        <a
          href={state.outputUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          Open generated image
        </a>
      )}
    </form>
  );
}
