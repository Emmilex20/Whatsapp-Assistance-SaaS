import { getCustomerMessageIntent } from "@/lib/customer-message-intent";

export function buildRuleBasedCustomerReply({
  restaurantName,
  message,
}: {
  restaurantName: string;
  message: string;
}) {
  const intent = getCustomerMessageIntent(message);

  if (intent === "greeting") {
    return `Hi, welcome to ${restaurantName}.

What would you like to do today? You can ask for the menu, ask about delivery, or just send the food name you want.`;
  }

  if (intent === "thanks") {
    return "You are welcome. I am here if you need anything else.";
  }

  if (intent === "price_check") {
    return `Please tell me the food item you want the price for, or ask for the menu to see available items and prices.`;
  }

  if (intent === "affirmative") {
    return `Great. Please send the food name you want to order, or ask for the menu if you want to choose from available items.`;
  }

  if (intent === "negative") {
    return `No problem. Whenever you are ready, you can ask for the menu, delivery fee, opening hours, or type a food name.`;
  }

  return `I want to make sure I understand you correctly.

You can ask for the menu, ask about delivery, check a price, or type the food name you want to order.`;
}
