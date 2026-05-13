import Link from "next/link";
import { Clock, Eye, MapPin, Plus, ShoppingBag, UserRound } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/client";
import { confirmOrder, updateOrderStatus } from "@/actions/orders";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getOrderNextAction } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<OrderStatus, string> = {
  NEW: "bg-yellow-400/10 text-yellow-300",
  CONFIRMED: "bg-blue-400/10 text-blue-300",
  PREPARING: "bg-purple-400/10 text-purple-300",
  READY: "bg-emerald-400/10 text-emerald-300",
  DELIVERED: "bg-emerald-500/10 text-emerald-200",
  CANCELLED: "bg-red-400/10 text-red-300",
};

const nextStatuses: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

export default async function OrdersPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const orders = restaurant
    ? await prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          conversation: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Orders</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Restaurant orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Track WhatsApp and manually created customer orders in one place.
          </p>
        </div>

        <Link href="/dashboard/orders/new">
          <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            <Plus className="mr-2" size={16} />
            New order
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
          <p className="text-sm text-yellow-100">Needs confirmation</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {orders.filter((order) => order.status === "NEW").length}
          </h2>
        </div>

        <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
          <p className="text-sm text-blue-100">In progress</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {
              orders.filter((order) =>
                ["CONFIRMED", "PREPARING", "READY"].includes(order.status)
              ).length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm text-emerald-100">Completed</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {orders.filter((order) => order.status === "DELIVERED").length}
          </h2>
        </div>
      </section>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders will appear here after WhatsApp order collection is connected or when you create one manually."
          action="Create first order"
          href="/dashboard/orders/new"
        />
      ) : (
        <section className="grid gap-4">
          {orders.map((order) => {
            const itemsSubtotal = order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-semibold text-white">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
                      </span>

                      {order.conversationId && (
                        <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                          WhatsApp
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-emerald-400" />
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Customer
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-white">
                          {order.customerName || order.customerPhone}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {order.customerPhone}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-emerald-400" />
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Delivery
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-white">
                          {order.deliveryAddress || "No address added"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-emerald-400" />
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Created
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-white">
                          {order.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-white">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mt-4 text-sm leading-6 text-zinc-400">
                        Note: {order.notes}
                      </p>
                    )}

                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-300">
                        Next action
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-200">
                        {getOrderNextAction(order.status)}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-52 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mb-3 h-9 w-full rounded-full border-white/10 bg-white/[0.03] text-xs text-white hover:bg-white/10"
                      >
                        <Eye className="mr-1.5" size={14} />
                        View details
                      </Button>
                    </Link>

                    <p className="text-sm text-zinc-500">Order total</p>
                    <h3 className="mt-1 text-2xl font-semibold text-white">
                      ₦{order.totalAmount.toLocaleString()}
                    </h3>

                    <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Items</span>
                        <span>₦{itemsSubtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Delivery</span>
                        <span>
                          {order.deliveryFee
                            ? `₦${order.deliveryFee.toLocaleString()}`
                            : "Not added"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.status === "NEW" && (
                        <form action={confirmOrder}>
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />

                          <Button className="mb-3 h-9 w-full rounded-full bg-emerald-500 text-xs text-white hover:bg-emerald-400">
                            Confirm order
                          </Button>
                        </form>
                      )}

                      {nextStatuses.map((status) => (
                        <form key={status} action={updateOrderStatus}>
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <input type="hidden" name="status" value={status} />

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-full rounded-full border-white/10 bg-white/[0.03] text-xs text-white hover:bg-white/10"
                          >
                            Mark {status.toLowerCase()}
                          </Button>
                        </form>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
