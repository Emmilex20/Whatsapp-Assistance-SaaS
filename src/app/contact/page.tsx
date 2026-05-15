import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { companyInfo } from "@/lib/company";

export const metadata: Metadata = {
  title: "Contact | ServeFlow",
  description:
    "Contact ServeFlow for WhatsApp Business assistant pilots, support, and business verification details.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <LandingNavbar />

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-emerald-400">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Talk to ServeFlow.
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Contact us for pilot onboarding, WhatsApp setup support, business
            verification requests, and product questions.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-4xl gap-4 px-4 md:grid-cols-3">
          {[
            {
              label: "Email",
              value: companyInfo.email,
              icon: Mail,
              href: `mailto:${companyInfo.email}`,
            },
            {
              label: "Phone",
              value: companyInfo.phone,
              icon: Phone,
              href: `tel:${companyInfo.phone.replaceAll(" ", "")}`,
            },
            {
              label: "Business address",
              value: companyInfo.address,
              icon: MapPin,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/3 p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <item.icon size={18} />
              </div>
              <p className="text-sm text-zinc-500">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-2 block wrap-break-word text-sm font-semibold text-white transition hover:text-emerald-300"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 wrap-break-word text-sm font-semibold text-white">
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-4 max-w-4xl px-4">
          <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Business verification note
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Before submitting to Meta, replace the placeholder phone number
              with the official business phone and connect a custom domain with
              matching business email.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
