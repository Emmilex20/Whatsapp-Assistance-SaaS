import { MessageSquareText } from "lucide-react";
import { appName } from "@/lib/site";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
        <MessageSquareText size={18} />
      </div>

      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-white">
          {appName}
        </p>
        <p className="text-[11px] text-zinc-400">Restaurant Assistant</p>
      </div>
    </div>
  );
}