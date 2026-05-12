import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-base font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-zinc-500">
            Manage your restaurant assistant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="hidden rounded-full text-zinc-400 hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <Search size={18} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <Bell size={18} />
          </Button>

          <MobileSidebar />
        </div>
      </div>
    </header>
  );
}