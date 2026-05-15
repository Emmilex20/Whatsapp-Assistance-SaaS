"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCampaignPost } from "@/actions/campaign-posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditCampaignPostFormProps = {
  post: {
    id: string;
    title: string;
    platform: string;
    scheduledAt: Date;
    notes: string | null;
    socialAccountId?: string | null;
    autoPostEnabled?: boolean;
  };
  socialAccounts?: {
    id: string;
    displayName: string;
    paused: boolean;
  }[];
};

const initialState = { success: "", error: "" };

function toDateTimeLocal(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  return localDate.toISOString().slice(0, 16);
}

export function EditCampaignPostForm({
  post,
  socialAccounts = [],
}: EditCampaignPostFormProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateCampaignPost(formData);

      if (result?.success) {
        setOpen(false);
      }

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

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="outline"
        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
      >
        <Pencil className="mr-2" size={14} />
        Edit
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
    >
      <input type="hidden" name="id" value={post.id} />

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          name="title"
          defaultValue={post.title}
          required
          className="h-10 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <select
          name="platform"
          defaultValue={post.platform}
          className="h-10 rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          <option>WhatsApp Status</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>X / Twitter</option>
          <option>TikTok</option>
          <option>Other</option>
        </select>

        <Input
          name="scheduledAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(post.scheduledAt)}
          required
          className="h-10 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <select
          name="socialAccountId"
          defaultValue={post.socialAccountId || ""}
          className="h-10 rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          <option value="">Manual posting only</option>
          {socialAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName}
              {account.paused ? " (paused)" : ""}
            </option>
          ))}
        </select>

        <textarea
          name="notes"
          defaultValue={post.notes || ""}
          placeholder="Notes..."
          className="min-h-20 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>

      <label className="mt-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 text-xs leading-5 text-zinc-300">
        <input
          name="autoPostEnabled"
          type="checkbox"
          defaultChecked={Boolean(post.autoPostEnabled)}
          className="mt-0.5 h-4 w-4 accent-emerald-500"
          disabled={socialAccounts.length === 0}
        />
        Auto-post this item when the schedule time arrives.
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          disabled={pending}
          className="h-9 rounded-full bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400"
        >
          {pending ? "Saving..." : "Save changes"}
        </Button>

        <Button
          type="button"
          onClick={() => setOpen(false)}
          variant="outline"
          className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
