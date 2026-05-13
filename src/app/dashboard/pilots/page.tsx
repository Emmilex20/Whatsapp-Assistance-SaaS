import Link from "next/link";
import type { PilotStatus } from "@/generated/prisma/client";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { deletePilotClient, updatePilotStatus } from "@/actions/pilot";
import { CreatePilotClientForm } from "@/components/pilots/create-pilot-client-form";
import { PilotFollowUpForm } from "@/components/pilots/pilot-follow-up-form";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<PilotStatus, string> = {
  NEW: "bg-zinc-400/10 text-zinc-300",
  CONTACTED: "bg-blue-400/10 text-blue-300",
  SETUP_IN_PROGRESS: "bg-yellow-400/10 text-yellow-300",
  LIVE_TESTING: "bg-purple-400/10 text-purple-300",
  ACTIVE: "bg-emerald-400/10 text-emerald-300",
  NOT_INTERESTED: "bg-red-400/10 text-red-300",
};

const nextStatuses: PilotStatus[] = [
  "CONTACTED",
  "SETUP_IN_PROGRESS",
  "LIVE_TESTING",
  "ACTIVE",
  "NOT_INTERESTED",
];

export default async function PilotsPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const pilots = restaurant
    ? await prisma.pilotClient.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        include: {
          checklist: true,
        },
      })
    : [];
  const today = new Date();

  const followUpsDue = pilots.filter((pilot) => {
    if (!pilot.nextContactAt) return false;
    return pilot.nextContactAt <= today && pilot.status !== "ACTIVE";
  });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          Pilot onboarding
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          First restaurant clients
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Track restaurants you are manually onboarding before the full public
          SaaS launch.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Total pilots",
            value: pilots.length,
          },
          {
            label: "Contacted",
            value: pilots.filter((pilot) => pilot.status === "CONTACTED")
              .length,
          },
          {
            label: "Live testing",
            value: pilots.filter((pilot) => pilot.status === "LIVE_TESTING")
              .length,
          },
          {
            label: "Active",
            value: pilots.filter((pilot) => pilot.status === "ACTIVE").length,
          },
          {
            label: "Follow-ups due",
            value: followUpsDue.length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      {followUpsDue.length > 0 && (
        <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            Follow-ups due today
          </h2>
          <p className="mt-2 text-sm leading-6 text-yellow-100">
            You have {followUpsDue.length} pilot client
            {followUpsDue.length > 1 ? "s" : ""} to follow up with. Send a
            short, calm message and move them to the next status if they
            respond.
          </p>

          <div className="mt-4 space-y-2">
            {followUpsDue.map((pilot) => (
              <div
                key={pilot.id}
                className="rounded-2xl border border-yellow-400/20 bg-zinc-950/40 p-4"
              >
                <p className="text-sm font-medium text-white">
                  {pilot.businessName}
                </p>
                <p className="mt-1 text-sm text-yellow-100">{pilot.phone}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <CreatePilotClientForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Pilot client list
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Move each business through your onboarding pipeline.
          </p>

          <div className="mt-5 space-y-3">
            {pilots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No pilot clients yet. Add your first restaurant or food vendor.
              </div>
            ) : (
              pilots.map((pilot) => (
                <div
                  key={pilot.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {pilot.businessName}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            statusStyles[pilot.status]
                          }`}
                        >
                          {pilot.status.replaceAll("_", " ")}
                        </span>

                        {pilot.status === "ACTIVE" && (
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                            Converted
                          </span>
                        )}

                        <Link
                          href={`/dashboard/pilots/${pilot.id}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          View details
                          <ArrowRight size={13} />
                        </Link>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
                        {pilot.contactName && (
                          <span className="flex items-center gap-1.5">
                            <UserRound size={14} />
                            {pilot.contactName}
                          </span>
                        )}

                        <span className="flex items-center gap-1.5">
                          <Phone size={14} />
                          {pilot.phone}
                        </span>

                        {pilot.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {pilot.location}
                          </span>
                        )}

                        {pilot.businessType && (
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} />
                            {pilot.businessType}
                          </span>
                        )}
                      </div>

                      {pilot.notes && (
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {pilot.notes}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                        {pilot.lastContactedAt && (
                          <span className="rounded-full bg-white/[0.04] px-3 py-1">
                            Last contacted:{" "}
                            {pilot.lastContactedAt.toLocaleDateString()}
                          </span>
                        )}

                        {pilot.nextContactAt && (
                          <span
                            className={`rounded-full px-3 py-1 ${
                              pilot.nextContactAt <= today &&
                              pilot.status !== "ACTIVE"
                                ? "bg-yellow-400/10 text-yellow-300"
                                : "bg-white/[0.04] text-zinc-400"
                            }`}
                          >
                            Next contact:{" "}
                            {pilot.nextContactAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {pilot.followUpNotes && (
                        <p className="mt-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-3 text-sm leading-6 text-zinc-400">
                          Follow-up: {pilot.followUpNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((status) => (
                        <form key={status} action={updatePilotStatus}>
                          <input type="hidden" name="id" value={pilot.id} />
                          <input type="hidden" name="status" value={status} />

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                          >
                            {status.replaceAll("_", " ").toLowerCase()}
                          </Button>
                        </form>
                      ))}

                      <form action={deletePilotClient}>
                        <input type="hidden" name="id" value={pilot.id} />
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

                  {pilot.checklist.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Setup progress</span>
                        <span className="text-emerald-300">
                          {Math.round(
                            (pilot.checklist.filter((item) => item.completed)
                              .length /
                              pilot.checklist.length) *
                              100
                          )}
                          %
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.round(
                              (pilot.checklist.filter(
                                (item) => item.completed
                              ).length /
                                pilot.checklist.length) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <PilotFollowUpForm
                    pilotId={pilot.id}
                    defaultNextContactAt={
                      pilot.nextContactAt
                        ? pilot.nextContactAt.toISOString().slice(0, 10)
                        : ""
                    }
                    defaultNotes={pilot.followUpNotes || ""}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
        <h2 className="text-base font-semibold text-white">Pilot target</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Your first goal is not 100 businesses. Start with 3 pilot restaurants,
          set them up manually, watch how they use the system, then improve
          based on their real problems.
        </p>
      </section>
    </div>
  );
}
