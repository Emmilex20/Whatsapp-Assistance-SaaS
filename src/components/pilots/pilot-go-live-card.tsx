"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { approvePilotGoLive, revokePilotGoLive } from "@/actions/pilot";
import { Button } from "@/components/ui/button";

type PilotGoLiveCardProps = {
  pilotId: string;
  approved: boolean;
  approvedAt?: string | null;
  canGoLive: boolean;
  passedRequiredCount: number;
  requiredCount: number;
  missingRequired: string[];
  incompleteRequired: {
    title: string;
  }[];
  failedRequired: {
    title: string;
  }[];
  goLiveNotes?: string | null;
};

const initialState = {
  success: "",
  error: "",
};

export function PilotGoLiveCard({
  pilotId,
  approved,
  approvedAt,
  canGoLive,
  passedRequiredCount,
  requiredCount,
  missingRequired,
  incompleteRequired,
  failedRequired,
  goLiveNotes,
}: PilotGoLiveCardProps) {
  const [approveState, approveAction, approving] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await approvePilotGoLive(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  const [revokeState, revokeAction, revoking] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await revokePilotGoLive(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (approveState.success) toast.success(approveState.success);
    if (approveState.error) toast.error(approveState.error);
  }, [approveState]);

  useEffect(() => {
    if (revokeState.success) toast.success(revokeState.success);
    if (revokeState.error) toast.error(revokeState.error);
  }, [revokeState]);

  return (
    <section
      className={`rounded-3xl border p-5 ${
        approved
          ? "border-emerald-400/20 bg-emerald-400/10"
          : canGoLive
            ? "border-blue-400/20 bg-blue-400/10"
            : "border-yellow-400/20 bg-yellow-400/10"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              approved
                ? "bg-emerald-500 text-white"
                : canGoLive
                  ? "bg-blue-500 text-white"
                  : "bg-yellow-400/20 text-yellow-100"
            }`}
          >
            {approved ? (
              <Unlock size={18} />
            ) : canGoLive ? (
              <CheckCircle2 size={18} />
            ) : (
              <Lock size={18} />
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {approved
                ? "Pilot is approved for live use"
                : canGoLive
                  ? "Pilot is ready for approval"
                  : "Pilot launch is locked"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Required tests passed: {passedRequiredCount}/{requiredCount}.
              {approved && approvedAt
                ? ` Approved on ${new Date(approvedAt).toLocaleString()}.`
                : ""}
            </p>

            {goLiveNotes && (
              <p className="mt-3 rounded-2xl border border-white/10 bg-zinc-950/30 p-3 text-sm leading-6 text-zinc-300">
                {goLiveNotes}
              </p>
            )}
          </div>
        </div>

        {approved ? (
          <form action={revokeAction}>
            <input type="hidden" name="pilotId" value={pilotId} />
            <Button
              disabled={revoking}
              variant="outline"
              className="h-10 rounded-full border-red-400/20 bg-red-400/10 px-5 text-sm text-red-300 hover:bg-red-400/20 disabled:opacity-60"
            >
              {revoking ? "Revoking..." : "Revoke go-live"}
            </Button>
          </form>
        ) : (
          <form action={approveAction} className="w-full lg:w-[280px]">
            <input type="hidden" name="pilotId" value={pilotId} />

            <textarea
              name="goLiveNotes"
              placeholder="Optional go-live notes..."
              className="mb-3 min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50"
            />

            <Button
              disabled={!canGoLive || approving}
              className="h-10 w-full rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving ? "Approving..." : "Approve go-live"}
            </Button>
          </form>
        )}
      </div>

      {!canGoLive && !approved && (
        <div className="mt-5 space-y-3">
          {missingRequired.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
              <p className="text-sm font-medium text-white">Missing tests</p>
              <p className="mt-2 text-sm text-yellow-100">
                {missingRequired.join(", ")}
              </p>
            </div>
          )}

          {incompleteRequired.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
              <p className="text-sm font-medium text-white">
                Incomplete required tests
              </p>
              <p className="mt-2 text-sm text-yellow-100">
                {incompleteRequired.map((test) => test.title).join(", ")}
              </p>
            </div>
          )}

          {failedRequired.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
              <p className="text-sm font-medium text-white">
                Failed required tests
              </p>
              <p className="mt-2 text-sm text-red-100">
                {failedRequired.map((test) => test.title).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
