"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  approveCustomerMemory,
  rejectCustomerMemory,
  updateCustomerMemory,
} from "@/actions/customer-memory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CustomerMemoryReviewCardProps = {
  memory: {
    id: string;
    customerPhone: string;
    key: string;
    value: string;
    confidence: number;
    source: string;
    createdAt: Date;
  };
};

const initialState = {
  success: "",
  error: "",
};

export function CustomerMemoryReviewCard({
  memory,
}: CustomerMemoryReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateCustomerMemory(formData);

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
  const [approveState, approveAction, approvePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await approveCustomerMemory(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await rejectCustomerMemory(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    [updateState, approveState, rejectState].forEach((state) => {
      if (state.success) toast.success(state.success);
      if (state.error) toast.error(state.error);
    });
  }, [updateState, approveState, rejectState]);

  if (editing) {
    return (
      <form
        action={updateAction}
        className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
      >
        <input type="hidden" name="id" value={memory.id} />

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="customerPhone"
            defaultValue={memory.customerPhone}
            required
            className="h-10 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white"
          />
          <Input
            name="key"
            defaultValue={memory.key}
            required
            className="h-10 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white"
          />
          <Input
            name="confidence"
            type="number"
            min={0}
            max={100}
            defaultValue={memory.confidence}
            className="h-10 rounded-2xl border-white/10 bg-zinc-950 text-sm text-white"
          />
          <select
            name="source"
            defaultValue={memory.source}
            className="h-10 rounded-2xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none"
          >
            <option>Conversation pattern</option>
            <option>Order history</option>
            <option>AI extraction</option>
            <option>Manual</option>
            <option>Staff observation</option>
          </select>
          <textarea
            name="value"
            defaultValue={memory.value}
            required
            className="min-h-24 resize-none rounded-2xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 md:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={updatePending}
            className="h-9 rounded-full bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400 disabled:opacity-60"
          >
            {updatePending ? "Updating..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(false)}
            className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-zinc-900/70 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{memory.key}</h3>
            <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
              Pending review
            </span>
            <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
              {memory.confidence}% confidence
            </span>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {memory.source}
            </span>
          </div>

          <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-zinc-300">
            {memory.value}
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            Created {memory.createdAt.toLocaleDateString()}
          </p>
        </div>

        <div className="action-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
          >
            <Pencil className="mr-2" size={14} />
            Edit
          </Button>

          <form action={approveAction}>
            <input type="hidden" name="id" value={memory.id} />
            <Button
              disabled={approvePending}
              className="h-9 rounded-full bg-emerald-500 px-3 text-xs text-white hover:bg-emerald-400 disabled:opacity-60"
            >
              <CheckCircle2 className="mr-2" size={14} />
              {approvePending ? "Approving..." : "Approve"}
            </Button>
          </form>

          <form action={rejectAction}>
            <input type="hidden" name="id" value={memory.id} />
            <Button
              disabled={rejectPending}
              variant="outline"
              className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20 disabled:opacity-60"
            >
              <XCircle className="mr-2" size={14} />
              {rejectPending ? "Rejecting..." : "Reject"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
