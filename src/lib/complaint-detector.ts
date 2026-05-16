import { prisma } from "@/lib/prisma";

type ComplaintSeverity = "low" | "medium" | "high";

type DetectComplaintParams = {
  restaurantId: string;
  conversationId: string;
  message: string;
};

type ComplaintDetection = {
  flagged: boolean;
  severity: ComplaintSeverity;
  reason: string;
};

const highSeverityPatterns = [
  "refund",
  "return my money",
  "chargeback",
  "fraud",
  "scam",
  "lawyer",
  "police",
  "sue",
  "hospital",
  "food poisoning",
  "poison",
  "sick",
  "vomit",
];

const mediumSeverityPatterns = [
  "wrong order",
  "wrong food",
  "missing item",
  "cold food",
  "late delivery",
  "delivery is late",
  "where is my order",
  "bad food",
  "terrible",
  "angry",
  "annoyed",
  "upset",
  "complain",
  "complaint",
  "rude",
];

const lowSeverityPatterns = [
  "not happy",
  "disappointed",
  "poor service",
  "taking too long",
  "delay",
  "delayed",
  "not satisfied",
  "unhappy",
  "bad service",
];

const negativeTonePatterns = [
  "nonsense",
  "this is bad",
  "very bad",
  "worst",
  "unacceptable",
  "never again",
  "i am tired",
  "i'm tired",
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function findPattern(message: string, patterns: string[]) {
  return patterns.find((pattern) => message.includes(pattern));
}

function chooseHigherSeverity(
  current: ComplaintSeverity,
  next: ComplaintSeverity
) {
  const score: Record<ComplaintSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  return score[next] > score[current] ? next : current;
}

function buildReason(parts: string[]) {
  return parts.join(" ");
}

export async function detectComplaint({
  restaurantId,
  conversationId,
  message,
}: DetectComplaintParams): Promise<ComplaintDetection> {
  const normalized = normalize(message);
  let severity: ComplaintSeverity = "low";
  const reasons: string[] = [];

  const highMatch = findPattern(normalized, highSeverityPatterns);
  const mediumMatch = findPattern(normalized, mediumSeverityPatterns);
  const lowMatch = findPattern(normalized, lowSeverityPatterns);
  const toneMatch = findPattern(normalized, negativeTonePatterns);

  if (highMatch) {
    severity = "high";
    reasons.push(`High-risk complaint keyword detected: "${highMatch}".`);
  }

  if (mediumMatch) {
    severity = chooseHigherSeverity(severity, "medium");
    reasons.push(`Complaint keyword detected: "${mediumMatch}".`);
  }

  if (lowMatch) {
    reasons.push(`Negative sentiment detected: "${lowMatch}".`);
  }

  if (toneMatch) {
    severity = chooseHigherSeverity(severity, "medium");
    reasons.push(`Angry or frustrated tone detected: "${toneMatch}".`);
  }

  const recentCustomerMessages = await prisma.message.findMany({
    where: {
      conversationId,
      senderType: "CUSTOMER",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  const complaintLikeMessages = recentCustomerMessages.filter((item) => {
    const content = normalize(item.content);

    return [
      ...highSeverityPatterns,
      ...mediumSeverityPatterns,
      ...lowSeverityPatterns,
      ...negativeTonePatterns,
    ].some((pattern) => content.includes(pattern));
  });

  if (complaintLikeMessages.length >= 2) {
    severity = chooseHigherSeverity(severity, "high");
    reasons.push("Repeated complaint pattern detected in recent messages.");
  }

  const unresolvedAlert = await prisma.complaintAlert.findFirst({
    where: {
      restaurantId,
      conversationId,
      resolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (unresolvedAlert && reasons.length > 0) {
    severity = chooseHigherSeverity(severity, "high");
    reasons.push("There is already an unresolved complaint for this chat.");
  }

  if (reasons.length === 0) {
    return {
      flagged: false,
      severity: "low",
      reason: "",
    };
  }

  return {
    flagged: true,
    severity,
    reason: buildReason(reasons),
  };
}

export async function detectAndEscalateComplaint(
  params: DetectComplaintParams
) {
  const detection = await detectComplaint(params);

  if (!detection.flagged) return null;

  const existingAlert = await prisma.complaintAlert.findFirst({
    where: {
      restaurantId: params.restaurantId,
      conversationId: params.conversationId,
      resolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const alert = existingAlert
    ? await prisma.complaintAlert.update({
        where: {
          id: existingAlert.id,
        },
        data: {
          severity: detection.severity,
          reason: detection.reason,
        },
      })
    : await prisma.complaintAlert.create({
        data: {
          restaurantId: params.restaurantId,
          conversationId: params.conversationId,
          severity: detection.severity,
          reason: detection.reason,
        },
      });

  const priority = detection.severity === "high" ? "URGENT" : "HIGH";
  const note = `Complaint escalation: ${detection.reason} AI auto-reply disabled for this chat. Manager review recommended.`;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: params.conversationId,
      restaurantId: params.restaurantId,
    },
  });

  await prisma.conversation.update({
    where: {
      id: params.conversationId,
    },
    data: {
      status: "HUMAN_TAKEOVER",
      priority,
      workflowStatus: "OPEN",
      tags: Array.from(new Set([...(conversation?.tags || []), "complaint"])),
      internalNotes: conversation?.internalNotes
        ? `${conversation.internalNotes}\n${note}`
        : note,
    },
  });

  return alert;
}

export async function hasUnresolvedComplaint(conversationId: string) {
  const alert = await prisma.complaintAlert.findFirst({
    where: {
      conversationId,
      resolved: false,
    },
    select: {
      reason: true,
      severity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return alert;
}
