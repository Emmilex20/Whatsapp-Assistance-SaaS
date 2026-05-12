import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { createManualOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          Add an order manually for now. Later, WhatsApp conversations will create orders automatically.
        </p>
      </section>

      <form
        action={createManualOrder}
        className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <ShoppingBag size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">Order details</h2>
            <p className="text-sm text-zinc-500">
              Keep it simple for the first version.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Customer name</label>
            <Input
              name="customerName"
              placeholder="Amaka Okafor"
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Customer phone</label>
            <Input
              name="customerPhone"
              required
              placeholder="+2348012345678"
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Item name</label>
            <Input
              name="itemName"
              required
              placeholder="Jollof Rice & Chicken"
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Quantity</label>
              <Input
                name="quantity"
                type="number"
                defaultValue={1}
                min={1}
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Price</label>
              <Input
                name="price"
                type="number"
                placeholder="3500"
                className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-zinc-300">Delivery address</label>
            <Input
              name="deliveryAddress"
              placeholder="Kubwa, Abuja"
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
            <p className="text-xs leading-5 text-zinc-500">
              If the address matches a saved delivery zone, the delivery fee
              will be added automatically.
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-zinc-300">Notes</label>
            <textarea
              name="notes"
              placeholder="Customer wants extra chicken..."
              className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
            />
          </div>
        </div>

        <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          Create order
        </Button>
      </form>
    </div>
  );
}
