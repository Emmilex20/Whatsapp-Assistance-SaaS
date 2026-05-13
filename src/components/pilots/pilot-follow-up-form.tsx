"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { updatePilotFollowUp } from "@/actions/pilot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PilotFollowUpFormProps = {
  pilotId: string;
  defaultNextContactAt?: string;
  defaultNotes?: string;
};

const initialState = {
  success: "",
  error: "",
};

export function PilotFollowUpForm({
  pilotId,
  defaultNextContactAt,
  defaultNotes,
}: PilotFollowUpFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updatePilotFollowUp(formData);

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
      className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
    >
      <input type="hidden" name="id" value={pilotId} />

      <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr_auto] md:items-end">
        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Next contact date</label>
          <Input
            name="nextContactAt"
            type="date"
            defaultValue={defaultNextContactAt}
            className="h-10 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Follow-up note</label>
          <Input
            name="followUpNotes"
            defaultValue={defaultNotes || ""}
            placeholder="Asked to check back next week..."
            className="h-10 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <Button
          disabled={pending}
          className="h-10 rounded-full bg-emerald-500 px-4 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          <CalendarCheck className="mr-2" size={15} />
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
