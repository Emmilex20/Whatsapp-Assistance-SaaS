import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionRequiredPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <section className="w-full max-w-xl rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <LockKeyhole size={24} />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Subscription required
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-300">
          Your 3-day free trial has ended. Choose a plan to continue using
          ServeFlow.
        </p>

        <Button
          asChild
          className="mt-6 h-10 rounded-full bg-emerald-500 px-6 text-sm text-white hover:bg-emerald-400"
        >
          <Link href="/dashboard/billing">View billing plans</Link>
        </Button>
      </section>
    </div>
  );
}
