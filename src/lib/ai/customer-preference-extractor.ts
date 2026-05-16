import { getAITextProvider } from "@/lib/ai/providers";
import { prisma } from "@/lib/prisma";

type ExtractCustomerPreferencesParams = {
  restaurantId: string;
  customerPhone: string;
  message?: string;
  order?: {
    itemNames: string[];
    deliveryAddress?: string | null;
    notes?: string | null;
  };
};

type ExtractedPreference = {
  key: string;
  value: string;
  confidence: number;
  source: string;
};

const HIGH_CONFIDENCE_THRESHOLD = 80;
const MAX_NEW_MEMORIES_PER_CUSTOMER_PER_DAY = 5;

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function clampConfidence(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function uniquePreferences(preferences: ExtractedPreference[]) {
  const seen = new Set<string>();

  return preferences.filter((preference) => {
    const signature = `${normalize(preference.key)}:${normalize(
      preference.value
    )}`;

    if (seen.has(signature)) return false;

    seen.add(signature);
    return true;
  });
}

function extractLocalPreferences({
  message,
  order,
}: ExtractCustomerPreferencesParams) {
  const preferences: ExtractedPreference[] = [];
  const text = message || "";
  const normalized = normalize(text);

  const favoriteMealMatch = text.match(
    /\b(?:my favorite|i love|i like|i prefer|i usually order|i always order)\s+(.{2,60})/i
  );

  if (favoriteMealMatch?.[1]) {
    preferences.push({
      key: "Favorite meal",
      value: favoriteMealMatch[1].replace(/[.!?]+$/, "").trim(),
      confidence: 78,
      source: "Conversation pattern",
    });
  }

  if (/\b(extra spicy|very spicy|peppery|more pepper)\b/.test(normalized)) {
    preferences.push({
      key: "Spice preference",
      value: "Prefers spicy food.",
      confidence: 86,
      source: "Conversation pattern",
    });
  }

  if (/\b(no pepper|not spicy|less pepper|mild)\b/.test(normalized)) {
    preferences.push({
      key: "Spice preference",
      value: "Prefers mild or low-pepper food.",
      confidence: 86,
      source: "Conversation pattern",
    });
  }

  const drinkMatch = text.match(
    /\b(?:with|add|include|i want|i prefer)\s+(coke|fanta|sprite|water|juice|malt|zobo|chapman)\b/i
  );

  if (drinkMatch?.[1]) {
    preferences.push({
      key: "Drink preference",
      value: `Often requests ${drinkMatch[1]}.`,
      confidence: 76,
      source: "Conversation pattern",
    });
  }

  const locationMatch = text.match(
    /\b(?:deliver to|delivery to|send to|address is|i am at|i'm at)\s+(.{3,80})/i
  );

  if (locationMatch?.[1]) {
    preferences.push({
      key: "Delivery location habit",
      value: locationMatch[1].replace(/[.!?]+$/, "").trim(),
      confidence: 82,
      source: "Conversation pattern",
    });
  }

  if (order?.itemNames.length) {
    preferences.push({
      key: "Repeat order behavior",
      value: `Recently ordered: ${order.itemNames.join(", ")}.`,
      confidence: order.itemNames.length > 1 ? 82 : 74,
      source: "Order history",
    });
  }

  if (order?.deliveryAddress) {
    preferences.push({
      key: "Delivery location habit",
      value: order.deliveryAddress,
      confidence: 84,
      source: "Order history",
    });
  }

  return uniquePreferences(preferences);
}

async function extractAIPreferences({
  message,
}: ExtractCustomerPreferencesParams) {
  if (process.env.AI_RESPONSES_ENABLED !== "true") return [];
  if (!message || message.length < 18 || message.length > 500) return [];

  const provider = getAITextProvider();

  const instructions = `
Extract stable restaurant customer preferences from one customer message.

Return only JSON in this exact shape:
{"preferences":[{"key":"...","value":"...","confidence":0,"source":"AI extraction"}]}

Allowed keys:
- Favorite meal
- Spice preference
- Delivery location habit
- Drink preference
- Repeat order behavior

Rules:
- Extract only reusable preferences.
- Do not extract temporary requests like "today", "now", or one-time complaints.
- Keep values short and factual.
- Confidence must be 0-100.
- Return {"preferences":[]} if nothing useful is present.
`.trim();

  try {
    const result = await provider.generateText({
      model: process.env.AI_MODEL || "gpt-5-mini",
      instructions,
      input: message,
    });

    const parsed = JSON.parse(result.text) as {
      preferences?: {
        key?: string;
        value?: string;
        confidence?: number;
        source?: string;
      }[];
    };

    return uniquePreferences(
      (parsed.preferences || [])
        .map((preference) => ({
          key: String(preference.key || "").trim(),
          value: String(preference.value || "").trim(),
          confidence: clampConfidence(Number(preference.confidence || 60)),
          source: preference.source || "AI extraction",
        }))
        .filter((preference) => preference.key && preference.value)
    ).slice(0, 3);
  } catch (error) {
    console.warn("Customer preference AI extraction skipped:", error);
    return [];
  }
}

async function canStoreMoreMemories({
  restaurantId,
  customerPhone,
}: {
  restaurantId: string;
  customerPhone: string;
}) {
  const since = new Date();
  since.setDate(since.getDate() - 1);

  const recentCount = await prisma.customerMemory.count({
    where: {
      restaurantId,
      customerPhone,
      createdAt: {
        gte: since,
      },
    },
  });

  return recentCount < MAX_NEW_MEMORIES_PER_CUSTOMER_PER_DAY;
}

async function upsertExtractedPreference({
  restaurantId,
  customerPhone,
  preference,
}: {
  restaurantId: string;
  customerPhone: string;
  preference: ExtractedPreference;
}) {
  const key = preference.key.trim();
  const value = preference.value.trim();

  if (!key || !value) return null;

  const existingMemories = await prisma.customerMemory.findMany({
    where: {
      restaurantId,
      customerPhone,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  const existing = existingMemories.find(
    (memory) => normalize(memory.key) === normalize(key)
  );

  if (existing) {
    const sameValue = normalize(existing.value) === normalize(value);

    if (sameValue) return existing;

    if (preference.confidence <= existing.confidence) return existing;

    return prisma.customerMemory.update({
      where: {
        id: existing.id,
      },
      data: {
        value,
        confidence: clampConfidence(preference.confidence),
        source: preference.source,
        reviewStatus:
          preference.confidence >= HIGH_CONFIDENCE_THRESHOLD
            ? "APPROVED"
            : "PENDING",
        active: preference.confidence >= HIGH_CONFIDENCE_THRESHOLD,
      },
    });
  }

  const approved = preference.confidence >= HIGH_CONFIDENCE_THRESHOLD;

  return prisma.customerMemory.create({
    data: {
      restaurantId,
      customerPhone,
      key,
      value,
      confidence: clampConfidence(preference.confidence),
      source: preference.source,
      reviewStatus: approved ? "APPROVED" : "PENDING",
      active: approved,
    },
  });
}

export async function extractCustomerPreferences(
  params: ExtractCustomerPreferencesParams
) {
  if (!(await canStoreMoreMemories(params))) {
    return {
      skipped: true,
      reason: "Daily memory extraction limit reached for this customer.",
      memories: [],
    };
  }

  const localPreferences = extractLocalPreferences(params);
  const aiPreferences = await extractAIPreferences(params);
  const preferences = uniquePreferences([
    ...localPreferences,
    ...aiPreferences,
  ]).slice(0, 4);

  const memories = [];

  for (const preference of preferences) {
    const memory = await upsertExtractedPreference({
      restaurantId: params.restaurantId,
      customerPhone: params.customerPhone,
      preference,
    });

    if (memory) memories.push(memory);
  }

  return {
    skipped: false,
    reason: "",
    memories,
  };
}
