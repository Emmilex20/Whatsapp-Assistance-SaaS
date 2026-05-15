import { Logo } from "@/components/shared/logo";
import { companyInfo, legalLinks } from "@/lib/company";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div>
          <Logo />
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
            Built for restaurants, food vendors, and WhatsApp-first businesses.
            Contact {companyInfo.email} for pilot onboarding.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
