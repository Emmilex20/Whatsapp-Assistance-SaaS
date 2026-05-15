"use client";

import { useActionState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteMediaGeneration } from "@/actions/media";
import { Button } from "@/components/ui/button";

type FavoriteMediaButtonProps = {
  id: string;
  favorite: boolean;
};

const initialState = {
  success: "",
  error: "",
};

export function FavoriteMediaButton({
  id,
  favorite,
}: FavoriteMediaButtonProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await toggleFavoriteMediaGeneration(formData);

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
        className={`h-9 rounded-full px-4 text-xs ${
          favorite
            ? "border-pink-400/20 bg-pink-400/10 text-pink-300 hover:bg-pink-400/20"
            : "border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
        }`}
      >
        <Heart
          className={`mr-2 ${favorite ? "fill-pink-300" : ""}`}
          size={14}
        />

        {favorite ? "Favorited" : "Favorite"}
      </Button>
    </form>
  );
}
