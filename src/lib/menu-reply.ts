import { prisma } from "@/lib/prisma";

export function isMenuRequest(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("menu") ||
    normalized.includes("food") ||
    normalized.includes("price list") ||
    normalized.includes("what do you have") ||
    normalized.includes("available food")
  );
}

export async function buildMenuReply(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  const items = await prisma.menuItem.findMany({
    where: {
      restaurantId,
      available: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  if (!items.length) {
    return `Thanks for asking. ${
      restaurant?.name || "Our restaurant"
    } has not added menu items yet. A staff member will reply shortly.`;
  }

  const groupedItems = items.reduce<Record<string, typeof items>>(
    (groups, item) => {
      const category = item.category || "Menu";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
      return groups;
    },
    {}
  );

  const menuSections = Object.entries(groupedItems)
    .map(([category, categoryItems]) => {
      const lines = categoryItems
        .map((item) => `• ${item.name} — ₦${item.price.toLocaleString()}`)
        .join("\n");

      return `*${category}*\n${lines}`;
    })
    .join("\n\n");

  return `Hello. Welcome to ${restaurant?.name || "our restaurant"}.

Here is today's menu:

${menuSections}

Reply with "I want [food name]" to start an order.`;
}
