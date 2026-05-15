export type FAQPreset = {
  question: string;
  answer: string;
  category: string;
};

export const recommendedFAQPresets: FAQPreset[] = [
  {
    category: "Delivery",
    question: "Do you deliver?",
    answer:
      "Yes, we deliver to selected areas. Please send your location so we can confirm delivery availability, fee, and estimated time.",
  },
  {
    category: "Delivery",
    question: "How much is delivery?",
    answer:
      "Delivery fee depends on your area. Please send your delivery location or nearest landmark so we can confirm the exact fee.",
  },
  {
    category: "Menu",
    question: "Can I see the menu?",
    answer:
      "Yes. Please ask for the menu or tell us what type of meal you want, and we will share available items and prices.",
  },
  {
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Send the food item, quantity, delivery address, name, phone number, and preferred payment method. We will confirm availability and total cost before processing.",
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer:
      "Available payment options may include transfer, cash, POS, or payment on delivery depending on the order. Please wait for our team to confirm payment details before sending money.",
  },
  {
    category: "Business",
    question: "What time do you open?",
    answer:
      "Please check our current opening hours in this chat or ask our team to confirm today's availability before placing an order.",
  },
  {
    category: "Business",
    question: "Where are you located?",
    answer:
      "Please ask for our address and nearest landmark. If you want delivery, send your location so we can confirm if we deliver to your area.",
  },
  {
    category: "Orders",
    question: "How long will my order take?",
    answer:
      "Preparation and delivery time depends on the meal and your location. We will confirm the estimated time after checking your order details.",
  },
  {
    category: "Support",
    question: "Can I speak to a staff member?",
    answer:
      "Yes. A team member can take over the chat. Please leave your question or order details here so we can help faster.",
  },
  {
    category: "Safety",
    question: "Can I get a refund or replacement?",
    answer:
      "Refunds and replacements are reviewed by a team member. Please send your order details, what happened, and any photo if available. We will handle it personally.",
  },
  {
    category: "Sales",
    question: "Do you take bulk orders or catering requests?",
    answer:
      "Yes, we can review bulk order requests. Please send the date, number of people, preferred meals, delivery location, and budget range.",
  },
  {
    category: "Marketing",
    question: "Do you have any promo or discount?",
    answer:
      "Promos and discounts change from time to time. Please ask what offers are available today and our team will confirm before you order.",
  },
];
