"use client";

import { useActionState, useEffect } from "react";
import { PauseCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { toggleSocialAccountPosting } from "@/actions/social-accounts";
import { Button } from "@/components/ui/button";

type ToggleSocialAccountButtonProps = {
  id: string;
  paused: boolean;
};

const initialState = {
  success: "",
  error: "",
};

export function ToggleSocialAccountButton({
  id,
  paused,
}: ToggleSocialAccountButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await toggleSocialAccountPosting(formData);

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
        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10 disabled:opacity-60"
      >
        {paused ? (
          <PlayCircle className="mr-2" size={14} />
        ) : (
          <PauseCircle className="mr-2" size={14} />
        )}
        {pending ? "Updating..." : paused ? "Resume" : "Pause"}
      </Button>
    </form>
  );
}
