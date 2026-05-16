"use client";

import { useActionState, useEffect, useState } from "react";
import { PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUpsellRule, toggleUpsellRule } from "@/actions/upsells";
import { Button } from "@/components/ui/button";

type UpsellRuleCardProps = {
  rule: {
    id: string;
    triggerItem: string;
    suggestedItem: string;
    message: string;
    active: boolean;
    attempts: number;
    acceptedUpsells: number;
    revenueGenerated: number;
  };
};

const initialState = {
  success: "",
  error: "",
};

export function UpsellRuleCard({ rule }: UpsellRuleCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [toggleState, toggleAction, togglePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await toggleUpsellRule(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await deleteUpsellRule(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    [toggleState, deleteState].forEach((state) => {
      if (state.success) toast.success(state.success);
      if (state.error) toast.error(state.error);
    });
  }, [toggleState, deleteState]);

  const acceptanceRate = rule.attempts
    ? Math.round((rule.acceptedUpsells / rule.attempts) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {rule.triggerItem} → {rule.suggestedItem}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                rule.active
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-zinc-400/10 text-zinc-300"
              }`}
            >
              {rule.active ? "Active" : "Paused"}
            </span>
          </div>

          <p className="mt-3 break-words text-sm leading-6 text-zinc-300">
            {rule.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {rule.attempts} attempts
            </span>
            <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
              {rule.acceptedUpsells} accepted
            </span>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              ₦{rule.revenueGenerated.toLocaleString()}
            </span>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {acceptanceRate}% acceptance
            </span>
          </div>
        </div>

        <div className="action-row">
          <form action={toggleAction}>
            <input type="hidden" name="id" value={rule.id} />
            <Button
              disabled={togglePending}
              variant="outline"
              className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            >
              {rule.active ? (
                <PauseCircle className="mr-2" size={14} />
              ) : (
                <PlayCircle className="mr-2" size={14} />
              )}
              {togglePending
                ? "Updating..."
                : rule.active
                  ? "Pause"
                  : "Resume"}
            </Button>
          </form>

          {confirmingDelete ? (
            <form action={deleteAction} className="flex gap-2">
              <input type="hidden" name="id" value={rule.id} />
              <Button
                disabled={deletePending}
                variant="outline"
                className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20 disabled:opacity-60"
              >
                {deletePending ? "Deleting..." : "Confirm delete"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmingDelete(false)}
                className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmingDelete(true)}
              className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20"
            >
              <Trash2 className="mr-2" size={14} />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
