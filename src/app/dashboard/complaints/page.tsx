import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react";
import { ResolveComplaintButton } from "@/components/complaints/resolve-complaint-button";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

const severityStyles: Record<string, string> = {
  high: "bg-red-400/10 text-red-300",
  medium: "bg-yellow-400/10 text-yellow-300",
  low: "bg-blue-400/10 text-blue-300",
};

export default async function ComplaintsPage() {
  await requirePermission("manage_inbox");

  const restaurant = await getOrCreateCurrentRestaurant();

  const alerts = restaurant
    ? await prisma.complaintAlert.findMany({
        where: {
          restaurantId: restaurant.id,
        },
        include: {
          conversation: {
            include: {
              assignedTeamMember: true,
              messages: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
          },
        },
        orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
      })
    : [];

  const openAlerts = alerts.filter((alert) => !alert.resolved);
  const resolvedAlerts = alerts.filter((alert) => alert.resolved);
  const highSeverity = openAlerts.filter(
    (alert) => alert.severity === "high"
  );
  const mediumSeverity = openAlerts.filter(
    (alert) => alert.severity === "medium"
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Complaint detection
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Customer complaint alerts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review chats where ServeFlow detected refund requests, angry tone,
          delivery issues, repeated complaints, or negative sentiment.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open alerts", value: openAlerts.length, icon: ShieldAlert },
          { label: "High severity", value: highSeverity.length, icon: AlertTriangle },
          {
            label: "Medium severity",
            value: mediumSeverity.length,
            icon: MessageSquareWarning,
          },
          { label: "Resolved", value: resolvedAlerts.length, icon: CheckCircle2 },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <item.icon size={18} />
            </div>
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} className="mt-1 text-red-100" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Safe escalation logic
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-100">
              Flagged chats are moved into human takeover, prioritized, tagged
              as complaints, and blocked from AI auto-reply until staff review.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Complaint queue
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Managers and inbox staff can open the chat, handle the customer, and
          mark the alert resolved.
        </p>

        <div className="mt-5 space-y-3">
          {alerts.length === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              title="No complaint alerts yet"
              description="Refund requests, angry messages, delivery complaints, and repeated negative messages will appear here automatically."
            />
          ) : (
            alerts.map((alert) => {
              const latestMessage = alert.conversation.messages[0]?.content;

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-4 ${
                    alert.resolved
                      ? "border-white/10 bg-zinc-900/70"
                      : "border-red-400/20 bg-zinc-950/60"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {alert.conversation.customerName ||
                            alert.conversation.customerPhone}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            severityStyles[alert.severity] ||
                            "bg-white/[0.04] text-zinc-400"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            alert.resolved
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {alert.resolved ? "Resolved" : "Open"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {alert.conversation.customerPhone} ·{" "}
                        {alert.createdAt.toLocaleString()}
                      </p>

                      <p className="mt-3 break-words text-sm leading-6 text-zinc-300">
                        {alert.reason}
                      </p>

                      {latestMessage && (
                        <p className="mt-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 text-sm leading-6 text-zinc-400">
                          Latest message: {latestMessage}
                        </p>
                      )}

                      {alert.conversation.assignedTeamMember && (
                        <p className="mt-3 text-xs text-zinc-500">
                          Assigned to{" "}
                          {alert.conversation.assignedTeamMember.name ||
                            alert.conversation.assignedTeamMember.email}
                        </p>
                      )}
                    </div>

                    <div className="action-row">
                      <Link
                        href={`/dashboard/inbox?conversation=${alert.conversationId}`}
                        className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10"
                      >
                        Open chat
                      </Link>

                      {!alert.resolved && (
                        <ResolveComplaintButton id={alert.id} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
