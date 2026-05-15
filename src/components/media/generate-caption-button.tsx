"use client";

import { useActionState, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { generateCaptionForMedia } from "@/actions/captions";
import { Button } from "@/components/ui/button";

type GenerateCaptionButtonProps = {
  mediaGenerationId: string;
};

const initialState = {
  success: "",
  error: "",
  caption: "",
  skipped: false,
};

export function GenerateCaptionButton({
  mediaGenerationId,
}: GenerateCaptionButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await generateCaptionForMedia(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
        caption: result?.caption || "",
        skipped: Boolean(result?.skipped),
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.skipped) toast.info(state.caption);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="mediaGenerationId"
        value={mediaGenerationId}
      />

      <Button
        disabled={pending}
        type="submit"
        variant="outline"
        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
      >
        <MessageSquareText className="mr-2" size={14} />
        {pending ? "Writing..." : "Generate caption"}
      </Button>
    </form>
  );
}
