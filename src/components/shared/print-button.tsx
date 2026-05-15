"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 print:hidden"
    >
      <Printer className="mr-2" size={16} />
      Print / Save as PDF
    </Button>
  );
}
