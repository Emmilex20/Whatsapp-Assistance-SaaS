"use client";

import { Building2 } from "lucide-react";
import { switchActiveRestaurant } from "@/actions/restaurants";

type RestaurantSwitcherProps = {
  activeRestaurantId?: string;
  restaurants: {
    id: string;
    name: string;
  }[];
};

export function RestaurantSwitcher({
  activeRestaurantId,
  restaurants,
}: RestaurantSwitcherProps) {
  if (!restaurants.length) {
    return null;
  }

  return (
    <form action={switchActiveRestaurant} className="mt-6">
      <label className="mb-2 block text-xs text-zinc-500">
        Active restaurant
      </label>

      <div className="relative">
        <Building2
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <select
          name="restaurantId"
          defaultValue={activeRestaurantId}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-900 pl-9 pr-3 text-sm text-white outline-none"
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
