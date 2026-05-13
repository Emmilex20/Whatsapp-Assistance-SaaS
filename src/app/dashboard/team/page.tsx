import Link from "next/link";
import type { TeamRole } from "@/generated/prisma/client";
import { BarChart3, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { removeTeamMember, updateTeamMemberRole } from "@/actions/team";
import { InviteTeamMemberForm } from "@/components/team/invite-team-member-form";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { getRestaurantUsage } from "@/lib/usage";

const roleStyles: Record<TeamRole, string> = {
  OWNER: "bg-emerald-400/10 text-emerald-300",
  MANAGER: "bg-blue-400/10 text-blue-300",
  AGENT: "bg-yellow-400/10 text-yellow-300",
};

const roles: TeamRole[] = ["AGENT", "MANAGER", "OWNER"];

export default async function TeamPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const teamMembers = restaurant
    ? await prisma.teamMember.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        include: {
          assignedConversations: true,
          assignedOrders: true,
        },
      })
    : [];

  const usage = restaurant ? await getRestaurantUsage(restaurant.id) : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Team</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Team members and agents
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Invite staff who can later handle customer chats, orders, and
            restaurant operations.
          </p>
        </div>

        <Link href="/dashboard/team/analytics">
          <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
            <BarChart3 className="mr-2" size={16} />
            Agent analytics
          </Button>
        </Link>
      </section>

      {usage && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Agent usage
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Current plan: {usage.plan}
              </p>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              {usage.usage.agents}/{usage.limits.agents} agents
            </span>
          </div>

          <div className="mt-4 h-2 rounded-full bg-zinc-800">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(
                  (usage.usage.agents / usage.limits.agents) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <InviteTeamMemberForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Current team</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Staff invited to this restaurant workspace.
          </p>

          <div className="mt-5 space-y-3">
            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No team members yet. Invite your first staff member.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                        <UserRound size={18} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {member.name || member.email}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              roleStyles[member.role]
                            }`}
                          >
                            {member.role}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              member.accepted
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-zinc-400/10 text-zinc-300"
                            }`}
                          >
                            {member.accepted ? "Accepted" : "Invited"}
                          </span>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                          <Mail size={14} />
                          {member.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span className="rounded-full bg-white/[0.04] px-3 py-1">
                            {member.assignedConversations.length} chats
                          </span>

                          <span className="rounded-full bg-white/[0.04] px-3 py-1">
                            {member.assignedOrders.length} orders
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <form key={role} action={updateTeamMemberRole}>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="role" value={role} />

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                          >
                            <ShieldCheck className="mr-1.5" size={13} />
                            {role.toLowerCase()}
                          </Button>
                        </form>
                      ))}

                      <form action={removeTeamMember}>
                        <input type="hidden" name="id" value={member.id} />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Multi-agent foundation
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          This prepares ServeFlow for assigning chats and orders to staff later.
          For now, team members are tracked at restaurant level.
        </p>
      </section>
    </div>
  );
}
