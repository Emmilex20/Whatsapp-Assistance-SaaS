import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />

      <section id="how-it-works" className="border-b border-white/10 bg-zinc-950 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-emerald-400">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              A simple flow restaurant owners can understand quickly.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Create restaurant profile",
              "Add menu and common replies",
              "Let the assistant handle WhatsApp questions",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/3 p-5"
              >
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-white">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Keep setup beginner-friendly so even non-technical restaurant owners can use it.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />
      <Footer />
    </main>
  );
}