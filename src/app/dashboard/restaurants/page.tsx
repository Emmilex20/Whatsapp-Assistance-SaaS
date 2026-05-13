import { Building2, CheckCircle2, Plus } from "lucide-react";
import { createRestaurant, switchActiveRestaurant } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCurrentRestaurant,
  getUserRestaurants,
} from "@/lib/current-restaurant";

export default async function RestaurantsPage() {
  const restaurants = await getUserRestaurants();
  const activeRestaurant = await getCurrentRestaurant();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Restaurants</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Manage restaurants
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Add and switch between different restaurant clients from one account.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <form
          action={createRestaurant}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Plus size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Add restaurant
              </h2>
              <p className="text-sm text-zinc-500">
                Create another restaurant workspace.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              name="name"
              required
              placeholder="New restaurant name"
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />

            <Button className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400">
              Create restaurant
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Your restaurants
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Select which restaurant dashboard you want to manage.
          </p>

          <div className="mt-5 space-y-3">
            {restaurants.map((restaurant) => {
              const active = restaurant.id === activeRestaurant?.id;

              return (
                <div
                  key={restaurant.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                      <Building2 size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {restaurant.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {active ? "Currently active" : "Workspace"}
                      </p>
                    </div>
                  </div>

                  {active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      <CheckCircle2 size={13} />
                      Active
                    </span>
                  ) : (
                    <form action={switchActiveRestaurant}>
                      <input
                        type="hidden"
                        name="restaurantId"
                        value={restaurant.id}
                      />

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
                      >
                        Switch
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
