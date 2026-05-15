import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { companyInfo } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms of Service | ServeFlow",
  description:
    "Terms of Service for ServeFlow, a WhatsApp Business assistant and operations dashboard.",
};

const terms = [
  {
    title: "Use of ServeFlow",
    body: "ServeFlow provides software tools for businesses to manage WhatsApp conversations, orders, promotions, staff tasks, and reports. You must use the service lawfully and only for businesses you are authorized to manage.",
  },
  {
    title: "Business responsibilities",
    body: "Businesses are responsible for the accuracy of menu items, prices, delivery information, policies, team access, WhatsApp configuration, and customer communications sent through the platform.",
  },
  {
    title: "WhatsApp and third-party services",
    body: "ServeFlow may connect with WhatsApp Cloud API, hosting providers, authentication providers, payment providers, AI providers, and media generation providers. Your use of those connected services may also be subject to their terms and policies.",
  },
  {
    title: "AI features",
    body: "AI suggestions and generated content are assistive tools. Businesses should review AI outputs before sending them to customers, especially for complaints, refunds, medical claims, legal issues, pricing, and delivery promises.",
  },
  {
    title: "Payments and subscriptions",
    body: "Paid plans, billing cycles, usage limits, and subscription terms will be shown in the product or agreed during onboarding. Access to paid features may be suspended if payment fails or the service is misused.",
  },
  {
    title: "Acceptable use",
    body: "You may not use ServeFlow to send spam, mislead customers, violate WhatsApp or Meta policies, abuse AI systems, upload unlawful content, interfere with the service, or access another business's data.",
  },
  {
    title: "Limitation of liability",
    body: "ServeFlow is provided as business software. To the maximum extent allowed by law, ServeFlow is not liable for indirect losses, lost profits, customer disputes, third-party outages, or business decisions made using the service.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <LandingNavbar />

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-emerald-400">
            Terms of Service
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Terms for using ServeFlow.
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Last updated: May 15, 2026. These terms describe the rules for
            using {companyInfo.name}, our WhatsApp Business assistant and
            operations dashboard.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl space-y-4 px-4">
          {terms.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-5"
            >
              <h2 className="text-base font-semibold text-white">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h2 className="text-base font-semibold text-white">Contact</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Questions about these terms can be sent to {companyInfo.email}.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
