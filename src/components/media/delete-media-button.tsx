"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMediaGeneration } from "@/actions/media";
import { Button } from "@/components/ui/button";

type DeleteMediaButtonProps = {
  id: string;
};

const initialState = {
  success: "",
  error: "",
};

export function DeleteMediaButton({ id }: DeleteMediaButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await deleteMediaGeneration(formData);

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
        type="submit"
        variant="outline"
        className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-4 text-xs text-red-300 hover:bg-red-400/20"
      >
        <Trash2 className="mr-2" size={14} />
        Delete
      </Button>
    </form>
  );
}
