"use client";

import { useActionState, useEffect } from "react";
import type { PilotTestStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { updatePilotTestStatus } from "@/actions/pilot";
import { Button } from "@/components/ui/button";

type PilotTestFormProps = {
  test: {
    id: string;
    pilotId: string;
    title: string;
    description: string | null;
    status: PilotTestStatus;
    notes: string | null;
  };
};

const initialState = {
  success: "",
  error: "",
};

const statuses: PilotTestStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PASSED",
  "FAILED",
];

export function PilotTestForm({ test }: PilotTestFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updatePilotTestStatus(formData);

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
      className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
    >
      <input type="hidden" name="id" value={test.id} />
      <input type="hidden" name="pilotId" value={test.pilotId} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">{test.title}</h3>

          {test.description && (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {test.description}
            </p>
          )}

          <textarea
            name="notes"
            defaultValue={test.notes || ""}
            placeholder="Test notes..."
            className="mt-4 min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
          />
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              name="status"
              value={status}
              disabled={pending}
              size="sm"
              variant="outline"
              className={`h-8 rounded-full border-white/10 px-3 text-xs text-white hover:bg-white/10 ${
                test.status === status ? "bg-white/10" : "bg-white/[0.03]"
              }`}
            >
              {status.replaceAll("_", " ").toLowerCase()}
            </Button>
          ))}
        </div>
      </div>
    </form>
  );
}
