"use client";

import { useActionState, useEffect, useState } from "react";
import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  archiveCustomerMemory,
  deleteCustomerMemory,
  updateCustomerMemory,
} from "@/actions/customer-memory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CustomerMemoryCardProps = {
  memory: {
    id: string;
    customerPhone: string;
    key: string;
    value: string;
    confidence: number;
    source: string;
    active: boolean;
    createdAt: Date;
  };
};

const initialState = {
  success: "",
  error: "",
};

export function CustomerMemoryCard({ memory }: CustomerMemoryCardProps) {
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
  const [archiveState, archiveAction, archivePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await archiveCustomerMemory(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const confirmed = window.confirm("Delete this customer memory?");

      if (!confirmed) return initialState;

      const result = await deleteCustomerMemory(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    [updateState, archiveState, deleteState].forEach((state) => {
      if (state.success) toast.success(state.success);
      if (state.error) toast.error(state.error);
    });
  }, [updateState, archiveState, deleteState]);

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
            <option>Manual</option>
            <option>Conversation pattern</option>
            <option>Order history</option>
            <option>AI extraction</option>
            <option>Inbox note</option>
            <option>Order note</option>
            <option>Staff observation</option>
            <option>Imported</option>
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
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{memory.key}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                memory.active
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-zinc-400/10 text-zinc-300"
              }`}
            >
              {memory.active ? "Active" : "Archived"}
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

          <form action={archiveAction}>
            <input type="hidden" name="id" value={memory.id} />
            <input type="hidden" name="active" value={String(memory.active)} />
            <Button
              disabled={archivePending}
              variant="outline"
              className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            >
              {memory.active ? (
                <Archive className="mr-2" size={14} />
              ) : (
                <RotateCcw className="mr-2" size={14} />
              )}
              {archivePending
                ? "Updating..."
                : memory.active
                  ? "Archive"
                  : "Restore"}
            </Button>
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="id" value={memory.id} />
            <Button
              disabled={deletePending}
              variant="outline"
              className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20 disabled:opacity-60"
            >
              <Trash2 className="mr-2" size={14} />
              {deletePending ? "Deleting..." : "Delete"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
