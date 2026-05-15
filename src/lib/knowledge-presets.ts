export type KnowledgePreset = {
  title: string;
  category: string;
  content: string;
};

export const recommendedKnowledgePresets: KnowledgePreset[] = [
  {
    title: "AI safety and human takeover",
    category: "Safety",
    content:
      "AI should not make final decisions on complaints, refunds, replacements, cancellations, food safety issues, angry customers, legal issues, or payment disputes. These cases should be escalated to a human team member for review.",
  },
  {
    title: "Order confirmation rule",
    category: "Orders",
    content:
      "An order should only be treated as confirmed after the customer provides the food item, quantity, delivery or pickup preference, name, phone number, delivery address if applicable, and payment preference. If any detail is missing, ask for the missing detail before confirming.",
  },
  {
    title: "Price confirmation rule",
    category: "Pricing",
    content:
      "Do not invent prices, discounts, delivery fees, or promo terms. Use saved menu prices and delivery zones when available. If pricing is not saved or unclear, tell the customer that a team member will confirm the total.",
  },
  {
    title: "Payment safety policy",
    category: "Payment",
    content:
      "Customers should not be asked to send payment until order availability, total amount, delivery fee, and payment details have been confirmed. If a customer asks for account details, confirm the order first or escalate to staff.",
  },
  {
    title: "Delivery information policy",
    category: "Delivery",
    content:
      "Delivery availability, fee, and estimated delivery time depend on the customer's location. If the exact area is unknown, ask for the delivery address or nearest landmark before giving a final delivery fee or ETA.",
  },
  {
    title: "Pickup policy",
    category: "Pickup",
    content:
      "If pickup is available, customers should receive the pickup location, expected preparation time, and instruction to wait for confirmation before coming. Do not promise immediate pickup unless staff confirms.",
  },
  {
    title: "Menu availability policy",
    category: "Menu",
    content:
      "Menu availability can change during the day. If a customer asks for an item that may be unavailable, confirm availability before taking payment. Suggest alternatives only from known menu items where possible.",
  },
  {
    title: "Opening hours policy",
    category: "Business",
    content:
      "Use saved opening and closing hours when answering availability questions. If the restaurant is closed or opening hours are unclear, tell customers that a team member will confirm when orders can be accepted.",
  },
  {
    title: "Bulk order policy",
    category: "Sales",
    content:
      "For bulk orders, catering, office orders, parties, or events, ask for event date, number of people, preferred meals, delivery location, budget range, and required delivery time. Escalate to staff for final pricing and availability.",
  },
  {
    title: "Promo and discount policy",
    category: "Marketing",
    content:
      "Do not invent promos or discounts. Only mention promos that are saved in campaign details, FAQs, automations, or knowledge base. If no promo is saved, say the team will confirm available offers.",
  },
  {
    title: "Complaint handling policy",
    category: "Support",
    content:
      "For complaints, wrong orders, missing items, poor food quality, late delivery, or rude service reports, apologize briefly, ask for order details and any photo if useful, and escalate to a human. Do not admit legal liability or promise refunds automatically.",
  },
  {
    title: "Refund and replacement policy",
    category: "Policy",
    content:
      "Refunds and replacements require human review. Ask the customer for order details, what happened, and proof if available. Do not approve refunds, replacements, or compensation automatically.",
  },
  {
    title: "Reservation policy",
    category: "Bookings",
    content:
      "For table reservations, ask for customer name, date, time, number of guests, and phone number. A team member should confirm availability before the reservation is treated as accepted.",
  },
  {
    title: "Unavailable customer request",
    category: "Support",
    content:
      "If the customer asks for something not available, explain politely that it may not be available and offer to check with the team. If possible, suggest related available menu items instead of making up new products.",
  },
  {
    title: "Tone of voice",
    category: "Brand",
    content:
      "Replies should be warm, clear, short, and helpful. Avoid sounding robotic. Use simple language. Do not overpromise. Ask one clear follow-up question when more information is needed.",
  },
  {
    title: "Personal data handling",
    category: "Privacy",
    content:
      "Customer phone numbers, addresses, and order details should be used only to process orders, delivery, support, and restaurant communication. Do not expose another customer's information in replies.",
  },
];
