import { ImageIcon, Palette, Sparkles } from "lucide-react";
import { BrandKitForm } from "@/components/brand/brand-kit-form";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function BrandPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Brand kit</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Restaurant brand identity
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Save brand details that will guide promo images, captions, and future
          marketing tools.
        </p>
      </section>

      {restaurant && (
        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <BrandKitForm
            restaurant={{
              brandPrimaryColor: restaurant.brandPrimaryColor,
              brandSecondaryColor: restaurant.brandSecondaryColor,
              brandSlogan: restaurant.brandSlogan,
              brandTone: restaurant.brandTone,
              brandLogoUrl: restaurant.brandLogoUrl,
              brandVisualStyle: restaurant.brandVisualStyle,
            }}
          />

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Palette size={18} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Brand preview
                  </h2>
                  <p className="text-sm text-zinc-500">
                    A simple preview of the saved identity.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
                <div className="flex items-center gap-4">
                  {restaurant.brandLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={restaurant.brandLogoUrl}
                      alt="Restaurant logo"
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                      <ImageIcon size={22} />
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {restaurant.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {restaurant.brandSlogan || "No slogan added yet"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                    {restaurant.brandTone || "No tone"}
                  </span>

                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                    {restaurant.brandVisualStyle || "No visual style"}
                  </span>

                  {restaurant.brandPrimaryColor && (
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                      Primary: {restaurant.brandPrimaryColor}
                    </span>
                  )}

                  {restaurant.brandSecondaryColor && (
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                      Secondary: {restaurant.brandSecondaryColor}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-1 text-emerald-300" />
                <div>
                  <h2 className="text-base font-semibold text-white">
                    How this helps AI media
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Promo generation can now include brand colors, tone, slogan,
                    and visual direction, so assets feel more consistent for
                    each restaurant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
