const orderKeywords = [
  "i want",
  "i need",
  "order",
  "buy",
  "send me",
  "deliver",
  "i will take",
  "can i get",
];

export function isOrderIntent(message: string) {
  const normalized = message.toLowerCase();

  return orderKeywords.some((keyword) => normalized.includes(keyword));
}

export function extractSimpleOrderItem(message: string) {
  return message
    .replace(/i want/gi, "")
    .replace(/i need/gi, "")
    .replace(/please/gi, "")
    .replace(/order/gi, "")
    .trim();
}
