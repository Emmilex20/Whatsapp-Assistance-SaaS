import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { pilotLaunchChecklist } from "@/lib/pilot-launch-checklist";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

export default async function PilotLaunchPage() {
  await requirePermission("manage_settings");

  const restaurant = await getOrCreateCurrentRestaurant();

  const stats = restaurant
    ? await Promise.all([
        prisma.menuItem.count({ where: { restaurantId: restaurant.id } }),
        prisma.deliveryZone.count({ where: { restaurantId: restaurant.id } }),
        prisma.fAQ.count({ where: { restaurantId: restaurant.id } }),
        prisma.knowledgeBaseItem.count({
          where: { restaurantId: restaurant.id },
        }),
        prisma.teamMember.count({ where: { restaurantId: restaurant.id } }),
        prisma.conversation.count({ where: { restaurantId: restaurant.id } }),
      ])
    : [0, 0, 0, 0, 0, 0];

  const [
    menuItems,
    deliveryZones,
    faqs,
    knowledgeItems,
    teamMembers,
    conversations,
  ] = stats;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Pilot launch</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Real pilot launch checklist
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Use this final checklist before allowing a real restaurant to depend
          on the WhatsApp assistant.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Menu items", value: menuItems, icon: Store },
          { label: "Delivery zones", value: deliveryZones, icon: Rocket },
          { label: "FAQs", value: faqs, icon: MessageSquareText },
          { label: "Knowledge", value: knowledgeItems, icon: Bot },
          { label: "Team members", value: teamMembers, icon: UsersRound },
          {
            label: "Conversations",
            value: conversations,
            icon: ClipboardCheck,
          },
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

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-1 text-yellow-100" />

          <div>
            <h2 className="text-base font-semibold text-white">
              Launch safety rule
            </h2>

            <p className="mt-2 text-sm leading-6 text-yellow-100">
              Do not enable full AI auto-reply or WhatsApp sending for real
              customers until inbound webhook, manual replies, safety blocks,
              and pilot tests have passed.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-base font-semibold text-white">
          Final pilot checklist
        </h2>

        <div className="mt-5 space-y-3">
          {pilotLaunchChecklist.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <CheckCircle2 size={18} className="mt-0.5 text-emerald-400" />

              <p className="text-sm leading-6 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/pilots"
          className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 transition hover:bg-emerald-400/20"
        >
          <h2 className="text-base font-semibold text-white">
            Open pilot clients
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Review pilot status, tests, and go-live approval.
          </p>
        </Link>

        <Link
          href="/dashboard/final-check/deployment"
          className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5 transition hover:bg-blue-400/20"
        >
          <h2 className="text-base font-semibold text-white">
            Open deployment checklist
          </h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Confirm production environment variables and deployment readiness.
          </p>
        </Link>
      </section>
    </div>
  );
}
