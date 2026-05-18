import { scoreIntentMatch } from "@/lib/customer-intent";

type MenuItemCandidate = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMenuPhrases(item: MenuItemCandidate) {
  return [item.name, item.category, item.description].filter(
    (value): value is string => Boolean(value)
  );
}

const genericMessageTokens = new Set([
  "hello",
  "hi",
  "hey",
  "ok",
  "okay",
  "yes",
  "yeah",
  "no",
  "nope",
  "thanks",
  "thank",
  "you",
  "please",
  "pls",
  "cancel",
  "stop",
  "status",
  "update",
]);

function getTokens(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function shouldSkipMenuMatching(normalizedMessage: string) {
  const tokens = getTokens(normalizedMessage);

  if (!tokens.length) return true;
  if (tokens.length === 1 && tokens[0].length < 4) return true;

  return tokens.every((token) => genericMessageTokens.has(token));
}

export function findBestMenuItemMatch<T extends MenuItemCandidate>({
  message,
  menuItems,
}: {
  message: string;
  menuItems: T[];
}) {
  const normalizedMessage = normalize(message);

  if (
    !normalizedMessage ||
    !menuItems.length ||
    shouldSkipMenuMatching(normalizedMessage)
  ) {
    return null;
  }

  const messageTokens = getTokens(normalizedMessage);
  const canUsePartialMessageMatch =
    normalizedMessage.length >= 4 &&
    !messageTokens.every((token) => genericMessageTokens.has(token));

  const scored = menuItems
    .map((item) => {
      const normalizedName = normalize(item.name);
      const directNameMatch =
        normalizedName.length >= 3 &&
        (normalizedMessage === normalizedName ||
          normalizedMessage.includes(normalizedName) ||
          (canUsePartialMessageMatch &&
            normalizedName.includes(normalizedMessage)));

      const score = directNameMatch
        ? 1
        : scoreIntentMatch(message, getMenuPhrases(item));

      return {
        item,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  return best && best.score >= 0.58 ? best.item : null;
}
