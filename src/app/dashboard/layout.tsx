import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateCurrentRestaurant();

  return (
    <main className="min-h-screen min-w-0 bg-zinc-950 print:bg-white">
      <div className="print:hidden">
        <DashboardSidebar />
      </div>

      <section className="min-w-0 lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <DashboardTopbar />
        </div>
        <div className="min-w-0 p-4 print:p-0 lg:p-6">{children}</div>
      </section>
    </main>
  );
}
