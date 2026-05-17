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
    return `Hello. Welcome to ${restaurantName}.

You can ask for the menu, delivery fee, opening hours, or type the food name you want to order.`;
  }

  if (intent === "thanks") {
    return "You are welcome.";
  }

  if (intent === "price_check") {
    return `Please tell me the food item you want the price for, or ask for the menu to see available items and prices.`;
  }

  if (intent === "affirmative") {
    return `Great. Please send the food name you want to order, or ask for the menu if you want to choose from available items.`;
  }

  if (intent === "negative") {
    return `No problem. You can ask for the menu, delivery fee, opening hours, or type a food name whenever you are ready.`;
  }

  return `I can help with menu, prices, delivery, opening hours, and orders.

You can type a food name like "jollof rice", ask "how much is burger?", or send "menu" to see available items.`;
}
