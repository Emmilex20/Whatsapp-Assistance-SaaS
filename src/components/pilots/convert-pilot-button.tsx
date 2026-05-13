"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRightCircle } from "lucide-react";
import { convertPilotToRestaurant } from "@/actions/pilot";
import { Button } from "@/components/ui/button";

type ConvertPilotButtonProps = {
  pilotId: string;
};

const initialState = {
  success: "",
  error: "",
};

export function ConvertPilotButton({ pilotId }: ConvertPilotButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await convertPilotToRestaurant(formData);

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
      <input type="hidden" name="pilotId" value={pilotId} />

      <Button
        disabled={pending}
        className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <ArrowRightCircle className="mr-2" size={16} />
        {pending ? "Converting..." : "Convert to active setup"}
      </Button>
    </form>
  );
}
