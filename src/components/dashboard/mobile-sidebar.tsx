"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DashboardNavScroll } from "@/components/dashboard/dashboard-nav-scroll";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import type { DashboardNotificationCounts } from "@/lib/dashboard-notifications";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileSidebarProps = {
  notificationCounts?: DashboardNotificationCounts;
};

export function MobileSidebar({ notificationCounts = {} }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
        className="h-dvh w-72 border-white/10 bg-zinc-950 p-4 text-white"
      >
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <div className="shrink-0">
          <Logo />
        </div>

        <DashboardNavScroll
          notificationCounts={notificationCounts}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
