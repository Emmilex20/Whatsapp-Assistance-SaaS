import { features } from "@/lib/site";

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-white/10 bg-zinc-950 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-emerald-400">Core features</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Everything a restaurant needs to start automating WhatsApp.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            We start simple: replies, menu, orders, inbox, and analytics. More modules come later.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-5 transition hover:bg-white/6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <feature.icon size={19} />
              </div>

              <h3 className="text-sm font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}