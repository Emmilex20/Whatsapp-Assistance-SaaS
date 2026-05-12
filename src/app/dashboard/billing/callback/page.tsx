import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingCallbackPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/3 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={24} />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          Payment received
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          This callback page is ready. In the database batch, we’ll verify the
          reference and activate the restaurant subscription automatically.
        </p>

        <Link href="/dashboard/billing">
          <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            Back to billing
          </Button>
        </Link>
      </div>
    </div>
  );
}