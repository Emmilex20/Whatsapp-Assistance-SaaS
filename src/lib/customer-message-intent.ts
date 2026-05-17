export type CustomerMessageIntent =
  | "cancel_order"
  | "order_status"
  | "change_order"
  | "price_check"
  | "greeting"
  | "thanks"
  | "affirmative"
  | "negative"
  | "unknown";

function normalizeMessage(message: string) {
  return message
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(message: string, phrases: string[]) {
  return phrases.some((phrase) => message.includes(phrase));
}

const cancelPhrases = [
  "cancel",
  "cancel my order",
  "cancel order",
  "stop my order",
  "abort",
  "forget it",
  "dont want",
  "don't want",
  "no longer want",
  "not buying again",
  "i changed my mind",
  "leave it",
];

const statusPhrases = [
  "status",
  "track",
  "where is my order",
  "where my order",
  "order update",
  "any update",
  "how far my order",
  "when will it arrive",
  "eta",
  "delivery time",
];

const changePhrases = [
  "change my order",
  "edit my order",
  "update my order",
  "replace",
  "swap",
  "add to my order",
  "remove from my order",
  "make it",
  "instead",
];

const pricePhrases = [
  "price",
  "how much",
  "cost",
  "amount",
  "rate",
  "charges",
  "what is the price",
];

const greetingPhrases = [
  "hello",
  "hi",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "how far",
  "sup",
  "whats up",
  "what's up",
];

const thanksPhrases = ["thanks", "thank you", "appreciate", "nice one"];

const affirmativePhrases = [
  "yes",
  "yeah",
  "yep",
  "correct",
  "okay",
  "ok",
  "sure",
  "go ahead",
  "confirm",
];

const negativePhrases = ["no", "nope", "not now", "later", "never mind"];

export function getCustomerMessageIntent(
  message: string
): CustomerMessageIntent {
  const normalized = normalizeMessage(message);

  if (!normalized) return "unknown";
  if (includesAny(normalized, cancelPhrases)) return "cancel_order";
  if (includesAny(normalized, statusPhrases)) return "order_status";
  if (includesAny(normalized, changePhrases)) return "change_order";
  if (includesAny(normalized, pricePhrases)) return "price_check";
  if (includesAny(normalized, greetingPhrases)) return "greeting";
  if (includesAny(normalized, thanksPhrases)) return "thanks";
  if (includesAny(normalized, affirmativePhrases)) return "affirmative";
  if (includesAny(normalized, negativePhrases)) return "negative";

  return "unknown";
}
