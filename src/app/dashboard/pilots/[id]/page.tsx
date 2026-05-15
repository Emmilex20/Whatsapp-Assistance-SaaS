import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Building2,
  CalendarCheck,
  Clock,
  FlaskConical,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { PilotStatus } from "@/generated/prisma/client";
import { deletePilotClient, updatePilotStatus } from "@/actions/pilot";
import { ConvertPilotButton } from "@/components/pilots/convert-pilot-button";
import { CreateDefaultTestsButton } from "@/components/pilots/create-default-tests-button";
import { PilotGoLiveCard } from "@/components/pilots/pilot-go-live-card";
import { PilotChecklist } from "@/components/pilots/pilot-checklist";
import { PilotFollowUpForm } from "@/components/pilots/pilot-follow-up-form";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getPilotGoLiveStatus } from "@/lib/pilot-go-live";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function PilotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const pilot = restaurant
    ? await prisma.pilotClient.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
        include: {
          checklist: {
            orderBy: {
              createdAt: "asc",
            },
          },
          tests: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
    : null;

  if (!pilot) notFound();

  const goLiveStatus = getPilotGoLiveStatus(pilot.tests);
  const timeline = [
    {
      title: "Pilot created",
      description: "Business was added to the pilot onboarding pipeline.",
      date: pilot.createdAt,
    },
    pilot.lastContactedAt
      ? {
          title: "Last contacted",
          description: pilot.followUpNotes || "Follow-up contact was recorded.",
          date: pilot.lastContactedAt,
        }
      : null,
    pilot.nextContactAt
      ? {
          title: "Next follow-up scheduled",
          description: "You planned a future follow-up with this business.",
          date: pilot.nextContactAt,
        }
      : null,
    {
      title: `Current status: ${pilot.status.replaceAll("_", " ")}`,
      description: "Move this pilot through the pipeline as they respond.",
      date: pilot.updatedAt,
    },
  ].filter(Boolean) as {
    title: string;
    description: string;
    date: Date;
  }[];

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/pilots"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to pilots
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Pilot client
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {pilot.businessName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  statusStyles[pilot.status]
                }`}
              >
                {pilot.status.replaceAll("_", " ")}
              </span>

              {pilot.businessType && (
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                  {pilot.businessType}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/dashboard/pilots/${pilot.id}/testing`}>
              <Button
                variant="outline"
                className="h-10 rounded-full border-white/10 bg-white/[0.03] px-5 text-sm text-white hover:bg-white/10"
              >
                <FlaskConical className="mr-2" size={16} />
                Testing flow
              </Button>
            </Link>

            <ConvertPilotButton pilotId={pilot.id} />

            <form action={deletePilotClient}>
              <input type="hidden" name="id" value={pilot.id} />
              <Button
                variant="outline"
                className="h-10 rounded-full border-red-400/20 bg-red-400/10 px-5 text-sm text-red-300 hover:bg-red-400/20"
              >
                Delete pilot
              </Button>
            </form>
          </div>
        </div>
      </section>

      <PilotGoLiveCard
        pilotId={pilot.id}
        approved={pilot.goLiveApproved}
        approvedAt={pilot.goLiveApprovedAt?.toISOString() || null}
        canGoLive={goLiveStatus.canGoLive}
        passedRequiredCount={goLiveStatus.passedRequiredCount}
        requiredCount={goLiveStatus.requiredCount}
        missingRequired={goLiveStatus.missingRequired}
        incompleteRequired={goLiveStatus.incompleteRequired.map((test) => ({
          title: test.title,
        }))}
        failedRequired={goLiveStatus.failedRequired.map((test) => ({
          title: test.title,
        }))}
        goLiveNotes={pilot.goLiveNotes}
      />

      {pilot.status !== "ACTIVE" && (
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h2 className="text-base font-semibold text-white">
            Ready to convert this pilot?
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            When this business is ready, convert them into your active
            restaurant setup. This will copy their business name, phone, and
            location into the main restaurant profile.
          </p>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Business profile
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Key details for outreach and onboarding.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                {
                  icon: Building2,
                  label: "Business",
                  value: pilot.businessName,
                },
                {
                  icon: UserRound,
                  label: "Contact",
                  value: pilot.contactName || "Not added",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: pilot.phone,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: pilot.email || "Not added",
                },
                {
                  icon: AtSign,
                  label: "Instagram",
                  value: pilot.instagram || "Not added",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: pilot.location || "Not added",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={15} className="text-emerald-400" />
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {item.label}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {pilot.notes && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Internal notes
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-400">
                  {pilot.notes}
                </p>
              </div>
            )}
          </div>

          <PilotChecklist pilotId={pilot.id} items={pilot.checklist} />

          {pilot.tests.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-white">
                Pilot test progress
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {pilot.tests.filter((test) => test.status === "PASSED").length}
                /{pilot.tests.length} tests passed
              </p>

              <div className="mt-4 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.round(
                      (pilot.tests.filter((test) => test.status === "PASSED")
                        .length /
                        pilot.tests.length) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
              <h2 className="text-base font-semibold text-white">
                No pilot tests yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Create the default testing checklist for older pilot clients
                created before this flow existed.
              </p>

              <div className="mt-4">
                <CreateDefaultTestsButton pilotId={pilot.id} />
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Status pipeline
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Move this pilot client through the onboarding process.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <form key={status} action={updatePilotStatus}>
                  <input type="hidden" name="id" value={pilot.id} />
                  <input type="hidden" name="status" value={status} />

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                  >
                    {status.replaceAll("_", " ").toLowerCase()}
                  </Button>
                </form>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h2 className="text-base font-semibold text-white">
              Follow-up planning
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Save the next date to contact this business and keep a short note
              about what they said.
            </p>

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
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Follow-up summary
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Last contacted
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {pilot.lastContactedAt
                    ? pilot.lastContactedAt.toLocaleDateString()
                    : "Not contacted yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={15} className="text-emerald-400" />
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Next contact
                  </p>
                </div>
                <p className="mt-2 text-sm text-white">
                  {pilot.nextContactAt
                    ? pilot.nextContactAt.toLocaleDateString()
                    : "Not scheduled"}
                </p>
              </div>

              {pilot.followUpNotes && (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Follow-up note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {pilot.followUpNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-white">
              Activity timeline
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Simple history for this pilot client.
            </p>

            <div className="mt-5 space-y-4">
              {timeline.map((item) => (
                <div
                  key={`${item.title}-${item.date.toISOString()}`}
                  className="relative pl-6"
                >
                  <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-400" />
                  <div className="absolute left-[5px] top-5 h-full border-l border-white/10" />

                  <p className="text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {item.date.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
