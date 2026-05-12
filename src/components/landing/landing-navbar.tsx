import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { navLinks } from "@/lib/site";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              size="sm"
              className="rounded-full bg-emerald-500 px-4 text-sm text-white hover:bg-emerald-400"
            >
              View Demo
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}