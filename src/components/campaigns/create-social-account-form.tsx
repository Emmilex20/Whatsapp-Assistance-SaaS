"use client";

import { useActionState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { createSocialAccount } from "@/actions/social-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socialPlatforms } from "@/lib/social-platforms";

const initialState = {
  success: "",
  error: "",
};

export function CreateSocialAccountForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createSocialAccount(formData);

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
          <Share2 size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Social permissions
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Save channels that can be used for scheduled campaign publishing.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          name="provider"
          defaultValue="FACEBOOK"
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          {socialPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>

        <Input
          name="displayName"
          required
          placeholder="Sweet Sensation Facebook Page"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <Input
          name="accountHandle"
          placeholder="@restaurant"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        />

        <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm leading-6 text-zinc-300">
          <input
            name="postingEnabled"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          I have permission from the restaurant to schedule and publish posts on
          this channel.
        </label>

        <textarea
          name="connectionNote"
          placeholder="Permission note, connected page, OAuth app note, or internal setup details..."
          className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save social permission"}
        </Button>
      </div>
    </form>
  );
}
