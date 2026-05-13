"use client";

import { useActionState, useEffect } from "react";
import { Copy, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateConversationAISuggestion } from "@/actions/ai";
import { Button } from "@/components/ui/button";

type AISuggestionPanelProps = {
  conversationId: string;
};

const initialState = {
  success: "",
  error: "",
  suggestion: "",
  skipped: false,
};

export function AISuggestionPanel({ conversationId }: AISuggestionPanelProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await generateConversationAISuggestion(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
        suggestion: result?.suggestion || "",
        skipped: Boolean(result?.skipped),
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success && !state.skipped) toast.success(state.success);
    if (state.skipped) toast.info("AI suggestions are currently disabled.");
    if (state.error) toast.error(state.error);
  }, [state]);

  async function copySuggestion() {
    if (!state.suggestion) return;

    await navigator.clipboard.writeText(state.suggestion);
    toast.success("Suggestion copied.");
  }

  function insertSuggestion() {
    if (!state.suggestion) return;

    window.dispatchEvent(
      new CustomEvent("insert-ai-suggestion", {
        detail: {
          suggestion: state.suggestion,
        },
      })
    );

    toast.success("Suggestion inserted into reply box.");
  }

  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            AI reply suggestion
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            Generate a safe draft, insert it into the reply box, edit it, then
            send manually.
          </p>
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="conversationId" value={conversationId} />

        <Button
          disabled={pending}
          className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          <Sparkles className="mr-2" size={16} />
          {pending ? "Thinking..." : "Generate suggestion"}
        </Button>
      </form>

      {state.suggestion && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-zinc-950/50 p-4">
          <p className="whitespace-pre-line text-sm leading-6 text-zinc-200">
            {state.suggestion}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={insertSuggestion}
              className="h-9 rounded-full bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400"
            >
              <Wand2 className="mr-2" size={14} />
              Insert into reply box
            </Button>

            <Button
              type="button"
              onClick={copySuggestion}
              variant="outline"
              className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
            >
              <Copy className="mr-2" size={14} />
              Copy reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
