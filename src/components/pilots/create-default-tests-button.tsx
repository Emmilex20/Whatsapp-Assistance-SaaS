"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { createDefaultPilotTests } from "@/actions/pilot";
import { Button } from "@/components/ui/button";

type CreateDefaultTestsButtonProps = {
  pilotId: string;
};

const initialState = {
  success: "",
  error: "",
};

export function CreateDefaultTestsButton({
  pilotId,
}: CreateDefaultTestsButtonProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createDefaultPilotTests(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }

    if (state.error) toast.error(state.error);
  }, [router, state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="pilotId" value={pilotId} />

      <Button
        disabled={pending}
        className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        <FlaskConical className="mr-2" size={16} />
        {pending ? "Creating..." : "Create test checklist"}
      </Button>
    </form>
  );
}
