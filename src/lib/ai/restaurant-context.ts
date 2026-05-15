import { prisma } from "@/lib/prisma";

export async function buildRestaurantAIContext(restaurantId: string) {
  const [
    restaurant,
    menuItems,
    deliveryZones,
    faqs,
    automations,
    knowledgeItems,
  ] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { id: restaurantId },
      }),

      prisma.menuItem.findMany({
        where: {
          restaurantId,
          available: true,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),

      prisma.deliveryZone.findMany({
        where: {
          restaurantId,
          active: true,
        },
        orderBy: { area: "asc" },
      }),

      prisma.fAQ.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      prisma.automation.findMany({
        where: {
          restaurantId,
          status: "ACTIVE",
        },
        orderBy: { usedCount: "desc" },
        take: 20,
      }),

      prisma.knowledgeBaseItem.findMany({
        where: {
          restaurantId,
          active: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
    ]);

  const menuText = menuItems.length
    ? menuItems
        .map(
          (item) =>
            `- ${item.name} (${item.category || "Menu"}): NGN ${item.price.toLocaleString()}`
        )
        .join("\n")
    : "No menu items saved.";

  const deliveryText = deliveryZones.length
    ? deliveryZones
        .map(
          (zone) =>
            `- ${zone.area}: NGN ${zone.fee.toLocaleString()}${
              zone.estimatedTime ? `, ${zone.estimatedTime}` : ""
            }`
        )
        .join("\n")
    : "No delivery zones saved.";

  const faqText = faqs.length
    ? faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n")
    : "No FAQs saved.";

  const automationText = automations.length
    ? automations
        .map(
          (rule) =>
            `Rule: ${rule.name}\nTriggers: ${rule.triggers.join(
              ", "
            )}\nReply: ${rule.response}`
        )
        .join("\n\n")
    : "No automation rules saved.";

  const knowledgeText = knowledgeItems.length
    ? knowledgeItems
        .map(
          (item) =>
            `Title: ${item.title}\nCategory: ${
              item.category || "General"
            }\nContent: ${item.content}`
        )
        .join("\n\n")
    : "No custom knowledge saved.";

  return `
Restaurant:
Name: ${restaurant?.name || "Restaurant"}
Address: ${restaurant?.address || "Not provided"}
WhatsApp: ${restaurant?.whatsappNumber || "Not provided"}
Opening hours: ${restaurant?.openingTime || "Not provided"} - ${
    restaurant?.closingTime || "Not provided"
  }

Brand kit:
Primary color: ${restaurant?.brandPrimaryColor || "Not provided"}
Secondary color: ${restaurant?.brandSecondaryColor || "Not provided"}
Slogan: ${restaurant?.brandSlogan || "Not provided"}
Tone: ${restaurant?.brandTone || "Not provided"}
Visual style: ${restaurant?.brandVisualStyle || "Not provided"}
Logo URL: ${restaurant?.brandLogoUrl || "Not provided"}

Menu:
${menuText}

Delivery zones:
${deliveryText}

FAQs:
${faqText}

Existing automation replies:
${automationText}

Custom knowledge:
${knowledgeText}
`.trim();
}
