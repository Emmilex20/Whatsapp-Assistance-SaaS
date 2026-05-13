"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { ConversationWorkflowStatus } from "@/generated/prisma/client";
import { updateConversationWorkflowStatus } from "@/actions/conversation-status";
import { Button } from "@/components/ui/button";

type ConversationStatusFormProps = {
  conversationId: string;
  workflowStatus: ConversationWorkflowStatus;
};

const initialState = {
  success: "",
  error: "",
};

export function ConversationStatusForm({
  conversationId,
  workflowStatus,
}: ConversationStatusFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateConversationWorkflowStatus(formData);

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Conversation status
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Track whether this customer issue is open, waiting, or resolved.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="conversationId" value={conversationId} />

        <select
          name="workflowStatus"
          defaultValue={workflowStatus}
          className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
        >
          <option value="OPEN">Open</option>
          <option value="PENDING">Pending</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save status"}
        </Button>
      </form>
    </div>
  );
}
