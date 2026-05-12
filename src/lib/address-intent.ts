const addressKeywords = [
  "address",
  "deliver to",
  "delivery address",
  "location",
  "bring it to",
  "send it to",
  "i am at",
  "my place",
  "estate",
  "street",
  "road",
  "junction",
  "bus stop",
];

export function isLikelyAddress(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.length > 15 && /\d/.test(normalized)) {
    return true;
  }

  return addressKeywords.some((keyword) => normalized.includes(keyword));
}
