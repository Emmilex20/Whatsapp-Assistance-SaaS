import { DashboardNavScroll } from "@/components/dashboard/dashboard-nav-scroll";
import {
  getCurrentRestaurant,
  getUserRestaurants,
} from "@/lib/current-restaurant";
import { RestaurantSwitcher } from "@/components/dashboard/restaurant-switcher";
import { Logo } from "@/components/shared/logo";

export async function DashboardSidebar() {
  const restaurants = await getUserRestaurants();
  const activeRestaurant = await getCurrentRestaurant();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-zinc-950 p-4 lg:flex">
      <div className="shrink-0">
        <Logo />

        <RestaurantSwitcher
          restaurants={restaurants}
          activeRestaurantId={activeRestaurant?.id}
        />
      </div>

      <DashboardNavScroll />
    </aside>
  );
}
