import type { ConversationPriority } from "@/generated/prisma/client";

export const priorityStyles: Record<ConversationPriority, string> = {
  LOW: "bg-zinc-400/10 text-zinc-300",
  NORMAL: "bg-emerald-400/10 text-emerald-300",
  HIGH: "bg-yellow-400/10 text-yellow-300",
  URGENT: "bg-red-400/10 text-red-300",
};
