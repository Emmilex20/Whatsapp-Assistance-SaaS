import type { ConversationWorkflowStatus } from "@/generated/prisma/client";

export const workflowStatusStyles: Record<ConversationWorkflowStatus, string> =
  {
    OPEN: "bg-emerald-400/10 text-emerald-300",
    PENDING: "bg-yellow-400/10 text-yellow-300",
    RESOLVED: "bg-blue-400/10 text-blue-300",
  };
