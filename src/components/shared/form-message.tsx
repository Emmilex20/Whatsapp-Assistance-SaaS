"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type FormMessageProps = {
  success?: string;
  error?: string;
};

export function FormMessage({ success, error }: FormMessageProps) {
  useEffect(() => {
    if (success) {
      toast.success(success);
    }

    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  return null;
}
