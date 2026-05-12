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
    <main className="min-h-screen bg-zinc-950">
      <DashboardSidebar />

      <section className="lg:pl-64">
        <DashboardTopbar />
        <div className="p-4 lg:p-6">{children}</div>
      </section>
    </main>
  );
}