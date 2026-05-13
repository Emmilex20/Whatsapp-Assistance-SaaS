import { Building2, Clock, MapPin, Phone } from "lucide-react";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function BusinessSettingsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Business settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Restaurant profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          This information will help your assistant respond with the correct
          restaurant details.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
        <BusinessProfileForm
          restaurant={{
            name: restaurant?.name || "",
            whatsappNumber: restaurant?.whatsappNumber || "",
            whatsappPhoneNumberId: restaurant?.whatsappPhoneNumberId || "",
            address: restaurant?.address || "",
            openingTime: restaurant?.openingTime || "",
            closingTime: restaurant?.closingTime || "",
          }}
        />

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <h2 className="text-base font-semibold text-white">
            Assistant preview
          </h2>
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
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
