import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TrialAccessGate } from "@/components/billing/trial-access-gate";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getCurrentTrialAccessStatus } from "@/lib/trial-access";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateCurrentRestaurant();
  const access = await getCurrentTrialAccessStatus();

  return (
    <main className="min-h-screen min-w-0 bg-zinc-950 print:bg-white">
      <div className="print:hidden">
        <DashboardSidebar />
      </div>

      <section className="min-w-0 lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <DashboardTopbar />
        </div>
        <div className="min-w-0 p-4 print:p-0 lg:p-6">
          <TrialAccessGate access={access}>{children}</TrialAccessGate>
        </div>
      </section>
    </main>
  );
}
