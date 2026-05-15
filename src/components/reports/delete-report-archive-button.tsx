"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReportArchive } from "@/actions/report-archive";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
};

const initialState = { success: "", error: "" };

export function DeleteReportArchiveButton({ id }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const confirmed = window.confirm("Delete this archived report?");
      if (!confirmed) return initialState;

      const result = await deleteReportArchive(formData);

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
      <input type="hidden" name="id" value={id} />

      <Button
        disabled={pending}
        variant="outline"
        className="h-10 rounded-full border-red-400/20 bg-red-400/10 px-5 text-sm text-red-300 hover:bg-red-400/20"
      >
        <Trash2 className="mr-2" size={16} />
        Delete archive
      </Button>
    </form>
  );
}
