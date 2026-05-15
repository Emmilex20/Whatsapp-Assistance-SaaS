import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  FlaskConical,
  Timer,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { PilotTestStatus } from "@/generated/prisma/client";
import { PilotGoLiveCard } from "@/components/pilots/pilot-go-live-card";
import { PilotTestForm } from "@/components/pilots/pilot-test-form";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { getPilotGoLiveStatus } from "@/lib/pilot-go-live";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusStyles: Record<PilotTestStatus, string> = {
  NOT_STARTED: "bg-zinc-400/10 text-zinc-300",
  IN_PROGRESS: "bg-yellow-400/10 text-yellow-300",
  PASSED: "bg-emerald-400/10 text-emerald-300",
  FAILED: "bg-red-400/10 text-red-300",
};

export default async function PilotTestingPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const pilot = restaurant
    ? await prisma.pilotClient.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
        include: {
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
  const passed = pilot.tests.filter((test) => test.status === "PASSED").length;
  const failed = pilot.tests.filter((test) => test.status === "FAILED").length;
  const inProgress = pilot.tests.filter(
    (test) => test.status === "IN_PROGRESS"
  ).length;

  const progress = pilot.tests.length
    ? Math.round((passed / pilot.tests.length) * 100)
    : 0;

  const readyForLive = pilot.tests.length > 0 && passed === pilot.tests.length;

  return (
    <div className="space-y-6">
      <section>
        <Link
          href={`/dashboard/pilots/${pilot.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to pilot
        </Link>

        <p className="text-sm font-medium text-emerald-400">Pilot testing</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {pilot.businessName} test flow
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Run these checks before allowing a real restaurant to depend on the
          assistant.
        </p>
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

      <section
        className={`rounded-3xl border p-5 ${
          readyForLive
            ? "border-emerald-400/20 bg-emerald-400/10"
            : failed
              ? "border-red-400/20 bg-red-400/10"
              : "border-yellow-400/20 bg-yellow-400/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              readyForLive
                ? "bg-emerald-500 text-white"
                : failed
                  ? "bg-red-500 text-white"
                  : "bg-yellow-400/20 text-yellow-100"
            }`}
          >
            {readyForLive ? (
              <CheckCircle2 size={18} />
            ) : failed ? (
              <CircleAlert size={18} />
            ) : (
              <FlaskConical size={18} />
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {readyForLive
                ? "Pilot is ready for live use"
                : failed
                  ? "Some tests failed"
                  : "Pilot testing in progress"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {readyForLive
                ? "All checks passed. You can move this pilot into real usage."
                : failed
                  ? "Fix failed areas before real customers depend on this setup."
                  : "Complete all test steps before onboarding real customers."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Passed",
            value: passed,
            icon: CheckCircle2,
          },
          {
            label: "Failed",
            value: failed,
            icon: CircleAlert,
          },
          {
            label: "In progress",
            value: inProgress,
            icon: Timer,
          },
          {
            label: "Progress",
            value: `${progress}%`,
            icon: FlaskConical,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <Icon size={18} />
              </div>

              <p className="text-sm text-zinc-500">{item.label}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </h2>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Test checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Mark each flow after testing with a real or trusted WhatsApp
              number.
            </p>
          </div>

          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            {progress}%
          </span>
        </div>

        <div className="mb-5 h-2 rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {pilot.tests.map((test) => (
            <div key={test.id} className="space-y-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs ${
                  statusStyles[test.status]
                }`}
              >
                {test.status.replaceAll("_", " ")}
              </span>

              <PilotTestForm test={test} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Live testing order
        </h2>

        <div className="mt-5 space-y-3">
          {[
            "Keep WHATSAPP_SEND_ENABLED=false for first webhook test.",
            "Send a real WhatsApp message to the business number.",
            "Confirm incoming message appears in Inbox.",
            "Enable WHATSAPP_SEND_ENABLED=true only after inbound flow works.",
            "Test menu, delivery, order, address, and status updates.",
            "Enable AI suggestions first before enabling AI auto-reply.",
            "Test blocked AI safety with refund/wrong order complaint.",
            "Only mark pilot ready when every critical test passes.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm leading-6 text-blue-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
