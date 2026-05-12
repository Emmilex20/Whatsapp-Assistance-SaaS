"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { dashboardLinks } from "@/lib/site";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Open navigation menu"
          className="rounded-full text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Menu size={18} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 border-white/10 bg-zinc-950 p-4 text-white"
      >
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <Logo />

        <nav className="mt-8 space-y-1">
          {dashboardLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/6 hover:text-white"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
