import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onboardingSteps } from "@/lib/site";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const [menuItems, faqs] = restaurant
    ? await Promise.all([
        prisma.menuItem.count({
          where: { restaurantId: restaurant.id },
        }),
        prisma.fAQ.count({
          where: { restaurantId: restaurant.id },
        }),
      ])
    : [0, 0];

  const stepStates = [
    {
      ...onboardingSteps[0],
      href: "/dashboard/settings/business",
      completed: Boolean(
        restaurant?.name &&
          restaurant.name !== "My Restaurant" &&
          restaurant.whatsappNumber &&
          restaurant.address
      ),
    },
    {
      ...onboardingSteps[1],
      href: "/dashboard/settings/business",
      completed: Boolean(restaurant?.openingTime && restaurant.closingTime),
    },
    {
      ...onboardingSteps[2],
      href: "/dashboard/menu",
      completed: menuItems > 0,
    },
    {
      ...onboardingSteps[3],
      href: "/dashboard/automations/faqs",
      completed: faqs > 0,
    },
  ];

  const completedSteps = stepStates.filter((step) => step.completed).length;
  const setupComplete = completedSteps === stepStates.length;
  const nextStep =
    stepStates.find((step) => !step.completed) ||
    stepStates[stepStates.length - 1];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-400">Restaurant setup</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {setupComplete
              ? "Your WhatsApp restaurant assistant is set up"
              : "Set up your WhatsApp restaurant assistant"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {setupComplete
              ? "Core restaurant details are complete. You can now review your dashboard, test WhatsApp, and prepare for real customer usage."
              : "Add the important business details your assistant will use to answer customers correctly."}
          </p>
        </div>

        <div className="mt-6">
          <Link href={setupComplete ? "/dashboard" : nextStep.href}>
            <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
              {setupComplete ? "Open dashboard" : "Continue setup"}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Setup progress
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {completedSteps} of {stepStates.length} setup steps completed.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs ${
              setupComplete
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-yellow-400/10 text-yellow-300"
            }`}
          >
            {setupComplete ? "Complete" : "In progress"}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
            style={{
              width: `${Math.round((completedSteps / stepStates.length) * 100)}%`,
            }}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {stepStates.map((step) => {
          const active = !step.completed && step.href === nextStep.href;

          return (
            <Link
              key={step.title}
              href={step.href}
              className={`rounded-3xl border p-5 transition ${
                step.completed
                  ? "border-emerald-400/20 bg-emerald-400/10 hover:bg-emerald-400/15"
                  : active
                  ? "border-yellow-400/20 bg-yellow-400/10 hover:bg-yellow-400/15"
                  : "border-white/10 bg-white/3 hover:bg-white/[0.06]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    step.completed
                      ? "bg-emerald-400/10 text-emerald-300"
                      : active
                      ? "bg-yellow-400/10 text-yellow-300"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Circle size={18} />
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    step.completed
                      ? "bg-emerald-400/10 text-emerald-300"
                      : active
                      ? "bg-yellow-400/10 text-yellow-300"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {step.completed ? "Completed" : active ? "In progress" : "Pending"}
                </span>
              </div>

              <h2 className="text-base font-semibold text-white">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {step.description}
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
