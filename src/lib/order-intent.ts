const orderKeywords = [
  "i want",
  "i need",
  "order",
  "buy",
  "send me",
  "get me",
  "give me",
  "deliver",
  "i will take",
  "i'll take",
  "can i get",
  "can you send",
  "can i order",
  "lemme get",
  "let me get",
];

export function isOrderIntent(message: string) {
  const normalized = message.toLowerCase();

  return orderKeywords.some((keyword) => normalized.includes(keyword));
}

export function extractSimpleOrderItem(message: string) {
  return message
    .replace(/i want/gi, "")
    .replace(/i need/gi, "")
    .replace(/can i get/gi, "")
    .replace(/can i order/gi, "")
    .replace(/can you send/gi, "")
    .replace(/send me/gi, "")
    .replace(/get me/gi, "")
    .replace(/give me/gi, "")
    .replace(/lemme get/gi, "")
    .replace(/let me get/gi, "")
    .replace(/i will take/gi, "")
    .replace(/i'll take/gi, "")
    .replace(/please/gi, "")
    .replace(/order/gi, "")
    .trim();
}
