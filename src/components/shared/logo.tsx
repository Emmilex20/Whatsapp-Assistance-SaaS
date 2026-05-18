import Image from "next/image";
import Link from "next/link";
import { appName } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Go to ServeFlow homepage"
      className="flex w-fit items-center gap-2 rounded-2xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
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
    </Link>
  );
}
