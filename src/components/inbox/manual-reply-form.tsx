"use client";

import { useActionState, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { sendHumanReply } from "@/actions/inbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ManualReplyFormProps = {
  conversationId: string;
  disabled: boolean;
};

const initialState = {
  success: "",
  error: "",
};

export function ManualReplyForm({
  conversationId,
  disabled,
}: ManualReplyFormProps) {
  const [message, setMessage] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await sendHumanReply(formData);

      if (result?.success) {
        setMessage("");
      }

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    function handleInsertSuggestion(event: Event) {
      const customEvent = event as CustomEvent<{ suggestion: string }>;
      setMessage(customEvent.detail.suggestion);
    }

    window.addEventListener("insert-ai-suggestion", handleInsertSuggestion);

    return () => {
      window.removeEventListener(
        "insert-ai-suggestion",
        handleInsertSuggestion
      );
    };
  }, []);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />

      <Input
        name="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={disabled || pending}
        placeholder={
          disabled
            ? "Enable human takeover to reply..."
            : "Type a manual reply..."
        }
        className="h-11 rounded-full border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <Button
        disabled={disabled || pending || !message.trim()}
        className="h-11 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} />
      </Button>
    </form>
  );
}
