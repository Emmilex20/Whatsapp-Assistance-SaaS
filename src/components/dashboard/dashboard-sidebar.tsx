import Link from "next/link";
import { dashboardLinks } from "@/lib/site";
import { Logo } from "@/components/shared/logo";

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-zinc-950 p-4 lg:block">
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
    </aside>
  );
}