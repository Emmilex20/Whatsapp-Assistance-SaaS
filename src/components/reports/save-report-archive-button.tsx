"use client";

import { useActionState, useEffect } from "react";
import { Archive } from "lucide-react";
import { toast } from "sonner";
import { saveReportArchive } from "@/actions/report-archive";
import { Button } from "@/components/ui/button";

type SaveReportArchiveButtonProps = {
  type: "WEEKLY" | "MONTHLY";
};

const initialState = {
  success: "",
  error: "",
};

export function SaveReportArchiveButton({
  type,
}: SaveReportArchiveButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await saveReportArchive(formData);

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
    <form action={formAction}>
      <input type="hidden" name="type" value={type} />

      <Button
        disabled={pending}
        variant="outline"
        className="h-10 rounded-full border-white/10 bg-white/[0.03] px-5 text-sm text-white hover:bg-white/10 disabled:opacity-60"
      >
        <Archive className="mr-2" size={16} />
        {pending ? "Saving..." : "Save archive"}
      </Button>
    </form>
  );
}
