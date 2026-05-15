"use client";

import { useActionState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { createCampaignPost } from "@/actions/campaign-posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateCampaignPostFormProps = {
  campaigns: {
    id: string;
    title: string;
  }[];
  teamMembers: {
    id: string;
    name: string | null;
    email: string;
  }[];
};

const initialState = { success: "", error: "" };

export function CreateCampaignPostForm({
  campaigns,
  teamMembers,
}: CreateCampaignPostFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCampaignPost(formData);

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
          <CalendarPlus size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Schedule post</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Plan when to publish campaign content.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          name="campaignId"
          required
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          {campaigns.length === 0 ? (
            <option value="">Create a campaign first</option>
          ) : (
            campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))
          )}
        </select>

        <Input
          name="title"
          required
          placeholder="Post weekend promo to WhatsApp Status"
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <select
          name="platform"
          defaultValue="WhatsApp Status"
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          <option>WhatsApp Status</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>TikTok</option>
          <option>Other</option>
        </select>

        <Input
          name="scheduledAt"
          type="datetime-local"
          required
          className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
        />

        <select
          name="assignedTeamMemberId"
          defaultValue=""
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          <option value="">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name || member.email}
            </option>
          ))}
        </select>

        <textarea
          name="notes"
          placeholder="Use first image and WhatsApp caption pack..."
          className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <Button
          disabled={pending || campaigns.length === 0}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Scheduling..." : "Schedule post"}
        </Button>
      </div>
    </form>
  );
}
