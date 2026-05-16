"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mic, Pencil } from "lucide-react";
import { updateVoiceTranscription } from "@/actions/voice-transcriptions";
import { Button } from "@/components/ui/button";

type VoiceTranscriptionCardProps = {
  transcription: {
    id: string;
    transcript: string | null;
    correctedText: string | null;
    confidence: number;
    status: string;
    error: string | null;
    mimeType: string | null;
    audioSize: number;
    audioAvailable: boolean;
  };
};

const initialState = {
  success: "",
  error: "",
};

export function VoiceTranscriptionCard({
  transcription,
}: VoiceTranscriptionCardProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateVoiceTranscription(formData);

      if (result?.success) {
        setEditing(false);
      }

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }

    if (state.error) toast.error(state.error);
  }, [state]);

  const displayText =
    transcription.correctedText || transcription.transcript || "";
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Mic size={16} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Voice note transcription
            </p>
            <p className="mt-1 break-words text-sm leading-6 text-zinc-300">
              {displayText || "Transcript unavailable."}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          {transcription.confidence}% confidence
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span className="rounded-full bg-white/[0.04] px-3 py-1">
          {transcription.status.toLowerCase()}
        </span>
        {transcription.mimeType && (
          <span className="rounded-full bg-white/[0.04] px-3 py-1">
            {transcription.mimeType}
          </span>
        )}
        {transcription.audioSize > 0 && (
          <span className="rounded-full bg-white/[0.04] px-3 py-1">
            {(transcription.audioSize / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {transcription.error && (
        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
          {transcription.error}
        </p>
      )}

      {transcription.audioAvailable ? (
        <audio
          controls
          preload="none"
          src={`/api/voice-transcriptions/${transcription.id}/audio`}
          className="mt-3 w-full"
        />
      ) : (
        <p className="mt-3 rounded-xl border border-white/10 bg-zinc-900/70 p-3 text-xs text-zinc-500">
          Original audio has expired or was cleaned up.
        </p>
      )}

      {!editing ? (
        <Button
          type="button"
          onClick={() => setEditing(true)}
          variant="outline"
          className="mt-3 h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
        >
          <Pencil className="mr-2" size={14} />
          Correct transcript
        </Button>
      ) : (
        <form action={formAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={transcription.id} />
          <input
            type="hidden"
            name="confidence"
            value={Math.max(transcription.confidence, 90)}
          />

          <textarea
            name="correctedText"
            defaultValue={displayText}
            required
            className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending}
              className="h-9 rounded-full bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400"
            >
              {pending ? "Saving..." : "Save correction"}
            </Button>

            <Button
              type="button"
              onClick={() => setEditing(false)}
              variant="outline"
              className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
