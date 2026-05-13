import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateManualOrderForm } from "@/components/orders/create-manual-order-form";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to orders
        </Link>

        <p className="text-sm font-medium text-emerald-400">Manual order</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Create customer order
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Add an order manually for now. Later, WhatsApp conversations will
          create orders automatically.
        </p>
      </section>

      <CreateManualOrderForm />
    </div>
  );
}
