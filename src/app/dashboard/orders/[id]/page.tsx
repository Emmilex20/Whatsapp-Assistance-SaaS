import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { assignOrder } from "@/actions/assignments";
import { updateOrderInternalNotes } from "@/actions/internal-notes";
import { confirmOrder, updateOrderStatus } from "@/actions/orders";
import { InternalNotesForm } from "@/components/shared/internal-notes-form";
import { AssignmentSelect } from "@/components/team/assignment-select";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getOrderNextAction } from "@/lib/order-workflow";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const order = restaurant
    ? await prisma.order.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
        include: {
          items: true,
          conversation: true,
          assignedTeamMember: true,
        },
      })
    : null;

  if (!order) {
    notFound();
  }

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const teamMembers = restaurant
    ? await prisma.teamMember.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Order details
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  statusStyles[order.status]
                }`}
              >
                {order.status}
              </span>

              {order.conversationId && (
                <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                  WhatsApp order
                </span>
              )}
            </div>
          </div>

          {order.status === "NEW" && (
            <form action={confirmOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
                Confirm order
              </Button>
            </form>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <UserRound size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  Customer information
                </h2>
                <p className="text-sm text-zinc-500">
                  Contact and delivery details for this order.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-2">
                  <UserRound size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Customer
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {order.customerName || "Unknown customer"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Phone
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {order.customerPhone}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Delivery address
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {order.deliveryAddress || "No delivery address yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Created
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {order.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-wide text-emerald-300">
              Next action
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              {getOrderNextAction(order.status)}
            </p>
          </div>

          {order.notes && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-white">
                Internal notes
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <ReceiptText size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">Receipt</h2>
                <p className="text-sm text-zinc-500">
                  Order cost breakdown.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Qty {item.quantity} x ₦{item.price.toLocaleString()}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      ₦{(item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Items subtotal</span>
                <span>₦{itemsSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Delivery fee</span>
                <span>
                  {order.deliveryFee
                    ? `₦${order.deliveryFee.toLocaleString()}`
                    : "Not added"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm font-medium text-white">Total</span>
                <span className="text-xl font-semibold text-white">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Assigned staff
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Assign this order to a team member.
            </p>

            <form action={assignOrder} className="mt-5">
              <input type="hidden" name="orderId" value={order.id} />

              <div className="flex gap-2">
                <AssignmentSelect
                  name="teamMemberId"
                  defaultValue={order.assignedTeamMemberId}
                  teamMembers={teamMembers}
                />

                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                >
                  Save
                </Button>
              </div>
            </form>

            <p className="mt-3 text-sm text-zinc-400">
              Current:{" "}
              {order.assignedTeamMember
                ? order.assignedTeamMember.name || order.assignedTeamMember.email
                : "Unassigned"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-3">
              <ShoppingBag size={18} className="text-emerald-400" />
              <div>
                <h2 className="text-base font-semibold text-white">
                  Update status
                </h2>
                <p className="text-sm text-zinc-500">
                  Move this order through the kitchen workflow.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {nextStatuses.map((status) => (
                <form key={status} action={updateOrderStatus}>
                  <input type="hidden" name="orderId" value={order.id} />
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

          <InternalNotesForm
            action={updateOrderInternalNotes}
            hiddenFieldName="orderId"
            hiddenFieldValue={order.id}
            defaultValue={order.internalNotes}
            title="Internal order notes"
            description="Staff-only operational notes for delivery, payment, or customer handling."
          />
        </aside>
      </section>
    </div>
  );
}
