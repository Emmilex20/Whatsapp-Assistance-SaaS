import { MapPin, Plus, Trash2, Truck } from "lucide-react";
import { createDeliveryZone, deleteDeliveryZone } from "@/actions/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export default async function DeliverySettingsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const zones = restaurant
    ? await prisma.deliveryZone.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Delivery settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Delivery areas and fees
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Add locations your restaurant delivers to. The assistant will use this
          when customers ask about delivery fees.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <form
          action={createDeliveryZone}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Truck size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Add delivery zone
              </h2>
              <p className="text-sm text-zinc-500">
                Example: Kubwa, Wuse, Gwarinpa.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Area</label>
              <Input
                name="area"
                required
                placeholder="Kubwa"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Delivery fee</label>
              <Input
                name="fee"
                required
                type="number"
                placeholder="1000"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Estimated time</label>
              <Input
                name="estimatedTime"
                placeholder="30 - 45 minutes"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <Button className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400">
              <Plus className="mr-2" size={16} />
              Save delivery zone
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Saved delivery zones
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Customers can ask about delivery fees to a saved area.
          </p>

          <div className="mt-5 space-y-3">
            {zones.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No delivery zones yet. Add your first delivery area.
              </div>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-emerald-400" />
                      <p className="text-sm font-medium text-white">
                        {zone.area}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-zinc-400">
                      ₦{zone.fee.toLocaleString()}
                      {zone.estimatedTime ? ` - ${zone.estimatedTime}` : ""}
                    </p>
                  </div>

                  <form action={deleteDeliveryZone}>
                    <input type="hidden" name="id" value={zone.id} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
