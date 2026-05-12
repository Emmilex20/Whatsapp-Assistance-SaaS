import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="text-sm text-zinc-500">
          Built for restaurants, food vendors, and WhatsApp-first businesses.
        </p>
      </div>
    </footer>
  );
}