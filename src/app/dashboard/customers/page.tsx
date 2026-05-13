import Link from "next/link";
import {
  ArrowRight,
  MessageSquareText,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getRestaurantCustomers } from "@/lib/customers";

export default async function CustomersPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const customers = restaurant
    ? await getRestaurantCustomers(restaurant.id)
    : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Customers</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Customer profiles
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          View customers who contacted the restaurant through WhatsApp, their messages, and order history.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Total customers</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {customers.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Total orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {customers.reduce((sum, customer) => sum + customer.orderCount, 0)}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Customer value</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            ₦
            {customers
              .reduce((sum, customer) => sum + customer.totalSpent, 0)
              .toLocaleString()}
          </h2>
        </div>
      </section>

      {customers.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No customers yet"
          description="Customers will appear here after WhatsApp conversations are saved. You can test this using the WhatsApp mock webhook."
          action="Open WhatsApp setup"
          href="/dashboard/settings/whatsapp"
        />
      ) : (
        <section className="grid gap-4">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/dashboard/customers/${customer.id}`}
              className="block rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {customer.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {customer.phone}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <ShoppingBag size={14} />
                        {customer.orderCount} orders
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MessageSquareText size={14} />
                        {customer.status === "HUMAN_TAKEOVER"
                          ? "Human takeover"
                          : "Bot active"}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-1 text-sm text-zinc-500">
                      {customer.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <div className="text-left lg:text-right">
                    <p className="text-sm text-zinc-500">Total spent</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      ₦{customer.totalSpent.toLocaleString()}
                    </p>
                  </div>

                  <ArrowRight size={17} className="text-zinc-500" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
