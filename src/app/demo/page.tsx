import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  MessageSquareText,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <Sparkles size={20} />
          </div>

          <p className="text-sm font-medium text-emerald-300">
            WhatsApp Restaurant Assistant Demo
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Let your restaurant reply faster, send menu, answer delivery
            questions, and collect orders on WhatsApp.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
            This demo shows how a restaurant assistant can reduce missed
            messages, reply instantly to customers, and help food vendors manage
            WhatsApp orders.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button className="h-11 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200">
                View dashboard demo
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>

            <a href="https://wa.me/" target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                className="h-11 rounded-full border-white/10 bg-white/3 px-5 text-sm text-white hover:bg-white/10"
              >
                Request setup
              </Button>
            </a>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Menu replies",
              description:
                "Customers ask for menu and receive food prices instantly.",
              icon: MessageSquareText,
            },
            {
              title: "Order flow",
              description:
                "Customers can start orders directly from WhatsApp.",
              icon: ShoppingBag,
            },
            {
              title: "Auto replies",
              description:
                "Common questions like delivery and opening hours are handled automatically.",
              icon: Bot,
            },
            {
              title: "Analytics",
              description:
                "Restaurant owners see messages, orders, and popular questions.",
              icon: BarChart3,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <item.icon size={18} />
              </div>

              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/3 p-6">
          <h2 className="text-xl font-semibold">Example WhatsApp flow</h2>

          <div className="mt-5 max-w-2xl space-y-3">
            <div className="max-w-[85%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
              Customer: Please send menu
            </div>

            <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white">
              Assistant: Here is today&apos;s menu with prices. Reply with
              &quot;I want [food name]&quot; to order.
            </div>

            <div className="max-w-[85%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
              Customer: I want Jollof Rice and Chicken
            </div>

            <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white">
              Assistant: Great choice. Please send your delivery address to
              continue.
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
