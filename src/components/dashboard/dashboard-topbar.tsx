import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import type { DashboardNotificationCounts } from "@/lib/dashboard-notifications";

type DashboardTopbarProps = {
  notificationCounts?: DashboardNotificationCounts;
};

export function DashboardTopbar({
  notificationCounts = {},
}: DashboardTopbarProps) {
  const notificationTotal = Object.values(notificationCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const hasNotifications = notificationTotal > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-base font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-zinc-500">
            Manage your Business assistant
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
            className="relative rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
            title={
              hasNotifications
                ? `${notificationTotal} dashboard notification${
                    notificationTotal === 1 ? "" : "s"
                  }`
                : "No dashboard notifications"
            }
          >
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-red-200/80 bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
              </span>
            )}
          </Button>

          <MobileSidebar notificationCounts={notificationCounts} />
        </div>
      </div>
    </header>
  );
}
