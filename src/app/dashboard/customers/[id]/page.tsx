import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  MessageSquareText,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { workflowStatusStyles } from "@/lib/conversation-status";
import { getCustomerProfile } from "@/lib/customers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const customer = restaurant
    ? await getCustomerProfile({
        restaurantId: restaurant.id,
        conversationId: id,
      })
    : null;

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/customers"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to customers
        </Link>

        <p className="text-sm font-medium text-emerald-400">Customer profile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {customer.customerName || "Unknown customer"}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
          <Phone size={15} />
          {customer.customerPhone}
        </p>
        <span
          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs ${
            workflowStatusStyles[customer.workflowStatus]
          }`}
        >
          {customer.workflowStatus}
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Messages</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {customer.messages.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {customer.orders.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-500">Total spent</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            ₦{totalSpent.toLocaleString()}
          </h2>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <MessageSquareText size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Conversation history
              </h2>
              <p className="text-sm text-zinc-500">
                Saved messages from this WhatsApp customer.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {customer.messages.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No messages yet.
              </p>
            ) : (
              customer.messages.map((message) => {
                const isCustomer = message.senderType === "CUSTOMER";
                const isBot = message.senderType === "BOT";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isCustomer ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isCustomer
                          ? "bg-zinc-800 text-zinc-200"
                          : isBot
                            ? "bg-emerald-500 text-white"
                            : "bg-blue-500 text-white"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        {isCustomer ? (
                          <UserRound size={14} />
                        ) : isBot ? (
                          <Bot size={14} />
                        ) : (
                          <UserRound size={14} />
                        )}

                        <span className="text-[11px] opacity-80">
                          {message.senderType}
                        </span>
                      </div>

                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <ShoppingBag size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Order history
              </h2>
              <p className="text-sm text-zinc-500">
                Orders linked to this customer.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {customer.orders.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No orders yet.
              </p>
            ) : (
              customer.orders.map((order) => (
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  key={order.id}
                  className="block rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {order.items[0]?.name || "No item"}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">
                    ₦{order.totalAmount.toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
