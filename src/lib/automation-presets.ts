export type AutomationPreset = {
  name: string;
  category: string;
  triggers: string[];
  response: string;
};

export const recommendedAutomationPresets: AutomationPreset[] = [
  {
    name: "Opening hours request",
    category: "Business",
    triggers: ["open", "opening time", "closing time", "hours", "are you open"],
    response:
      "Thanks for asking. We will confirm today's opening and closing time for you shortly. If you want to order now, please send the food item, quantity, delivery address, and payment preference.",
  },
  {
    name: "Restaurant location request",
    category: "Business",
    triggers: ["location", "address", "where are you", "shop address", "where is your restaurant"],
    response:
      "Thanks for reaching out. We will share our restaurant address and nearest landmark shortly. You can also send your delivery area so we can confirm if delivery is available there.",
  },
  {
    name: "Payment options",
    category: "Payment",
    triggers: ["payment", "pay", "transfer", "pos", "cash", "account number"],
    response:
      "We will confirm the available payment options for your order. Please avoid sending payment until your order total and payment details have been confirmed by our team.",
  },
  {
    name: "Human support request",
    category: "Support",
    triggers: ["agent", "human", "person", "manager", "talk to someone", "speak to someone"],
    response:
      "No problem. A team member will take over this chat shortly. Please leave your question here so we can help faster.",
  },
  {
    name: "Order status request",
    category: "Orders",
    triggers: ["where is my order", "order status", "track order", "my food", "delivery status"],
    response:
      "Please send your name, phone number, and order details so we can check your order status. A team member will confirm the latest update shortly.",
  },
  {
    name: "Complaint or refund escalation",
    category: "Safety",
    triggers: ["complaint", "refund", "wrong order", "bad food", "cancel", "angry"],
    response:
      "We are sorry about this. A team member will review your complaint personally. Please share your order details, what happened, and any photo if available. We will not process refunds or replacements automatically without human review.",
  },
  {
    name: "Bulk order inquiry",
    category: "Sales",
    triggers: ["bulk order", "catering", "party", "event", "office order", "large order"],
    response:
      "Thanks for your interest in a bulk order. Please send the event date, number of people, preferred meals, delivery location, and budget range. Our team will confirm availability and pricing.",
  },
  {
    name: "Promo inquiry",
    category: "Marketing",
    triggers: ["promo", "discount", "offer", "deal", "sales", "special"],
    response:
      "Thanks for asking about promos. We will confirm today's available offers shortly. Please note that discounts and prices are only valid after our team confirms them in this chat.",
  },
  {
    name: "Reservation or table booking",
    category: "Bookings",
    triggers: ["reservation", "book table", "table for", "booking", "reserve"],
    response:
      "Please send your name, preferred date and time, number of guests, and phone number. Our team will confirm if a table is available.",
  },
  {
    name: "Unavailable item fallback",
    category: "Menu",
    triggers: ["available", "do you have", "is it available", "sold out"],
    response:
      "Please tell us the item you want. We will confirm availability and suggest alternatives if it is sold out.",
  },
];
