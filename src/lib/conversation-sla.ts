import type { ConversationPriority, Message } from "@/generated/prisma/client";

type SlaPlan = "starter" | "growth" | "premium";

const planBaseMinutes: Record<SlaPlan, number> = {
  starter: 30,
  growth: 15,
  premium: 5,
};

const priorityMultiplier: Record<ConversationPriority, number> = {
  LOW: 1.5,
  NORMAL: 1,
  HIGH: 0.6,
  URGENT: 0.3,
};

export function getSlaTargetMinutes({
  plan,
  priority,
}: {
  plan?: string;
  priority: ConversationPriority;
}) {
  const safePlan: SlaPlan =
    plan === "growth" || plan === "premium" || plan === "starter"
      ? plan
      : "starter";

  const baseMinutes = planBaseMinutes[safePlan];
  const multiplier = priorityMultiplier[priority];

  return Math.max(2, Math.round(baseMinutes * multiplier));
}

export function getConversationSlaStatus({
  messages,
  plan,
  priority,
}: {
  messages: Message[];
  plan?: string;
  priority: ConversationPriority;
}) {
  const targetMinutes = getSlaTargetMinutes({
    plan,
    priority,
  });

  const lastCustomerMessage = [...messages]
    .reverse()
    .find((message) => message.senderType === "CUSTOMER");

  const lastResponseMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message.senderType === "BOT" || message.senderType === "HUMAN"
    );

  if (!lastCustomerMessage) {
    return {
      status: "NO_CUSTOMER_MESSAGE",
      label: "No customer message",
      overdue: false,
      minutesWaiting: 0,
      targetMinutes,
    };
  }

  if (
    lastResponseMessage &&
    lastResponseMessage.createdAt > lastCustomerMessage.createdAt
  ) {
    return {
      status: "REPLIED",
      label: "Replied",
      overdue: false,
      minutesWaiting: 0,
      targetMinutes,
    };
  }

  const minutesWaiting = Math.floor(
    (Date.now() - lastCustomerMessage.createdAt.getTime()) / 60000
  );

  const overdue = minutesWaiting >= targetMinutes;

  return {
    status: overdue ? "OVERDUE" : "WAITING",
    label: overdue ? "Overdue" : "Needs reply",
    overdue,
    minutesWaiting,
    targetMinutes,
  };
}

export function getSlaBadgeClass(status: string) {
  switch (status) {
    case "OVERDUE":
      return "bg-red-400/10 text-red-300";
    case "WAITING":
      return "bg-yellow-400/10 text-yellow-300";
    case "REPLIED":
      return "bg-emerald-400/10 text-emerald-300";
    default:
      return "bg-zinc-400/10 text-zinc-300";
  }
}
