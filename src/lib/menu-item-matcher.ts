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

export function findBestMenuItemMatch<T extends MenuItemCandidate>({
  message,
  menuItems,
}: {
  message: string;
  menuItems: T[];
}) {
  const normalizedMessage = normalize(message);

  if (!normalizedMessage || !menuItems.length) return null;

  const scored = menuItems
    .map((item) => {
      const normalizedName = normalize(item.name);
      const directNameMatch =
        normalizedName.length >= 3 &&
        (normalizedMessage === normalizedName ||
          normalizedMessage.includes(normalizedName) ||
          normalizedName.includes(normalizedMessage));

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
