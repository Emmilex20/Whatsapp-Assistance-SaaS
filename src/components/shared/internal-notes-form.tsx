"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type InternalNotesFormProps = {
  action: (formData: FormData) => Promise<{
    success?: string;
    error?: string;
  }>;
  hiddenFieldName: string;
  hiddenFieldValue: string;
  defaultValue?: string | null;
  title: string;
  description: string;
};

const initialState = {
  success: "",
  error: "",
};

export function InternalNotesForm({
  action,
  hiddenFieldName,
  hiddenFieldValue,
  defaultValue,
  title,
  description,
}: InternalNotesFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await action(formData);

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
          <FileText size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <form action={formAction}>
        <input
          type="hidden"
          name={hiddenFieldName}
          value={hiddenFieldValue}
        />

        <textarea
          name="internalNotes"
          defaultValue={defaultValue || ""}
          placeholder="Add internal notes for staff..."
          className="min-h-35 w-full rounded-3xl border border-white/10 bg-zinc-900 p-4 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <div className="mt-4 flex justify-end">
          <Button
            disabled={pending}
            className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save notes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
