"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} className={className}>
      {pending ? "Please wait..." : children}
    </Button>
  );
}
