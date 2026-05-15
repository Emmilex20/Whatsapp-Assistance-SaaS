import Image from "next/image";
import { appName } from "@/lib/site";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt={`${appName} logo`}
        width={36}
        height={36}
        priority
        className="h-9 w-9 rounded-2xl object-cover shadow-sm shadow-emerald-500/30"
      />

      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-white">
          {appName}
        </p>
        <p className="text-[11px] text-zinc-400">Business Assistant</p>
      </div>
    </div>
  );
}
