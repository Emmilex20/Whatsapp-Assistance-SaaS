"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { resolveComplaintAlert } from "@/actions/complaints";
import { Button } from "@/components/ui/button";

type ResolveComplaintButtonProps = {
  id: string;
};

const initialState = {
  success: "",
  error: "",
};

export function ResolveComplaintButton({ id }: ResolveComplaintButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await resolveComplaintAlert(formData);

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
        className="h-9 rounded-full bg-emerald-500 px-4 text-xs text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <CheckCircle2 className="mr-2" size={14} />
        {pending ? "Updating..." : "Mark resolved"}
      </Button>
    </form>
  );
}
