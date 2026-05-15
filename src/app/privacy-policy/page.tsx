import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { companyInfo } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy Policy | ServeFlow",
  description:
    "Privacy Policy for ServeFlow, a WhatsApp restaurant assistant and operations dashboard.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect account details, restaurant profile information, team member details, customer conversation data, order records, support requests, and usage logs needed to provide the ServeFlow service.",
  },
  {
    title: "How we use information",
    body: "We use information to operate the dashboard, connect WhatsApp workflows, help restaurants respond to customers, manage orders, improve product reliability, provide support, and generate operational reports.",
  },
  {
    title: "WhatsApp and customer data",
    body: "When a restaurant connects WhatsApp, ServeFlow may process customer names, phone numbers, messages, order details, and related metadata on behalf of that restaurant. Restaurants are responsible for having the right to communicate with their customers.",
  },
  {
    title: "AI processing",
    body: "ServeFlow may use AI providers to generate reply suggestions, captions, reports, and operational summaries when enabled. AI auto-reply should remain disabled until restaurant data and safety checks are reviewed.",
  },
  {
    title: "Data sharing",
    body: "We do not sell personal data. We may share data with service providers that help us host, secure, analyze, support, or deliver the product, including infrastructure, authentication, AI, media generation, payment, and messaging providers.",
  },
  {
    title: "Security and retention",
    body: "We use reasonable technical and organizational safeguards to protect data. We retain information for as long as needed to provide the service, comply with legal obligations, resolve disputes, and maintain business records.",
  },
  {
    title: "Your choices",
    body: "Restaurants can request access, correction, export, or deletion of their business data by contacting ServeFlow. Some records may be retained where required for security, compliance, billing, or legal reasons.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <LandingNavbar />

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-emerald-400">
            Privacy Policy
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            How ServeFlow handles business and customer data.
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Last updated: May 15, 2026. This policy explains how{" "}
            {companyInfo.name} collects, uses, and protects information when
            restaurants use our WhatsApp restaurant assistant and operations
            dashboard.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl space-y-4 px-4">
          {sections.map((section) => (
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
              Questions about privacy can be sent to {companyInfo.email}.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
