"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { assignCampaignPost } from "@/actions/campaign-posts";
import { Button } from "@/components/ui/button";

type CampaignPostAssignmentFormProps = {
  postId: string;
  assignedTeamMemberId?: string | null;
  teamMembers: {
    id: string;
    name: string | null;
    email: string;
  }[];
};

const initialState = { success: "", error: "" };

export function CampaignPostAssignmentForm({
  postId,
  assignedTeamMemberId,
  teamMembers,
}: CampaignPostAssignmentFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await assignCampaignPost(formData);

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
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="id" value={postId} />

      <select
        name="assignedTeamMemberId"
        defaultValue={assignedTeamMemberId || ""}
        className="h-9 min-w-0 rounded-full border border-white/10 bg-zinc-950 px-3 text-xs text-white outline-none"
      >
        <option value="">Unassigned</option>
        {teamMembers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name || member.email}
          </option>
        ))}
      </select>

      <Button
        disabled={pending}
        variant="outline"
        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
      >
        {pending ? "Saving..." : "Assign"}
      </Button>
    </form>
  );
}
