import { Building2, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { updateRestaurantProfile } from "@/actions/restaurant";

export default async function BusinessSettingsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Business settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Restaurant profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          This information will help your assistant respond with the correct restaurant details.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
        <form
          action={updateRestaurantProfile}
          className="rounded-3xl border border-white/10 bg-white/3 p-5"
        >
          <h2 className="text-base font-semibold text-white">Basic information</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add your restaurant name, WhatsApp number, and location.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Restaurant name</label>
              <Input
                name="name"
                defaultValue={restaurant?.name || ""}
                placeholder="Mama T’s Kitchen"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">WhatsApp number</label>
              <Input
                name="whatsappNumber"
                defaultValue={restaurant?.whatsappNumber || ""}
                placeholder="+234 801 234 5678"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">WhatsApp Phone Number ID</label>
              <Input
                name="whatsappPhoneNumberId"
                defaultValue={restaurant?.whatsappPhoneNumberId || ""}
                placeholder="123456789012345"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
              <p className="text-xs leading-5 text-zinc-500">
                This comes from your Meta WhatsApp Cloud API setup.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-300">Restaurant address</label>
              <Input
                name="address"
                defaultValue={restaurant?.address || ""}
                placeholder="Kubwa, Abuja, Nigeria"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Opening time</label>
              <Input
                name="openingTime"
                defaultValue={restaurant?.openingTime || ""}
                placeholder="9:00 AM"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Closing time</label>
              <Input
                name="closingTime"
                defaultValue={restaurant?.closingTime || ""}
                placeholder="9:00 PM"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            Save business profile
          </Button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">Assistant preview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            How your assistant may answer customers.
          </p>

          <div className="mt-5 space-y-3">
            {[
              {
                icon: Building2,
                title: "Business",
                text: `Welcome to ${restaurant?.name || "your restaurant"}.`,
              },
              {
                icon: Phone,
                title: "WhatsApp",
                text: restaurant?.whatsappNumber || "Add your WhatsApp number.",
              },
              {
                icon: MapPin,
                title: "Location",
                text: restaurant?.address || "Add your restaurant location.",
              },
              {
                icon: Clock,
                title: "Hours",
                text:
                  restaurant?.openingTime && restaurant?.closingTime
                    ? `We open from ${restaurant.openingTime} to ${restaurant.closingTime}.`
                    : "Add your opening and closing time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} className="text-emerald-400" />
                  <p className="text-sm font-medium text-white">{item.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
