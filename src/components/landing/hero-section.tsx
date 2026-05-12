import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-zinc-950">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-5 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            WhatsApp automation for restaurants
          </div>

          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Help restaurants reply faster, take orders, and stop losing WhatsApp customers.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            ServeFlow gives food vendors a simple dashboard to automate WhatsApp replies,
            manage customer messages, collect orders, and understand what customers ask most.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button className="h-11 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
                Open dashboard demo
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>

            <Button
              variant="outline"
              className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-sm text-white hover:bg-white/10"
            >
              See how it works
            </Button>
          </div>

          <div className="mt-7 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
            {["No complex setup", "Built for WhatsApp", "Restaurant-first"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/3 p-3 shadow-2xl shadow-emerald-950/30">
          <div className="rounded-[1.5rem] border border-white/10 bg-zinc-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Mama T’s Kitchen</p>
                <p className="text-xs text-zinc-500">WhatsApp assistant active</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Online
              </span>
            </div>

            <div className="space-y-3">
              <div className="max-w-[80%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
                Hello, do you have jollof rice?
              </div>

              <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white">
                Yes 😊 Jollof rice with chicken is ₦3,500. Would you like to place an order?
              </div>

              <div className="max-w-[75%] rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200">
                Please send menu.
              </div>

              <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white">
                Sure. Here is today’s menu: Rice, Shawarma, Chicken, Drinks and Specials.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {["248 chats", "42 orders", "94% replies"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/3 p-3 text-center text-xs text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}