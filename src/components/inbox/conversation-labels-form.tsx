"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import type { ConversationPriority } from "@/generated/prisma/client";
import { updateConversationLabels } from "@/actions/conversation-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConversationLabelsFormProps = {
  conversationId: string;
  priority: ConversationPriority;
  tags: string[];
};

const initialState = {
  success: "",
  error: "",
};

export function ConversationLabelsForm({
  conversationId,
  priority,
  tags,
}: ConversationLabelsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateConversationLabels(formData);

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
          <Tag size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Conversation labels
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Mark priority and add tags to help staff handle this chat.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="conversationId" value={conversationId} />

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Priority</label>
          <select
            name="priority"
            defaultValue={priority}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Tags</label>
          <Input
            name="tags"
            defaultValue={tags.join(", ")}
            placeholder="VIP, payment issue, delivery issue"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
          <p className="text-xs leading-5 text-zinc-500">
            Separate tags with commas.
          </p>
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save labels"}
        </Button>
      </form>
    </div>
  );
}
