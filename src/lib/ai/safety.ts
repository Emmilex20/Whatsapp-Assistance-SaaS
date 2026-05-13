const blockedKeywords = [
  "refund",
  "angry",
  "complain",
  "complaint",
  "wrong order",
  "wrong food",
  "food poisoning",
  "poison",
  "sick",
  "vomit",
  "hospital",
  "lawyer",
  "police",
  "chargeback",
  "scam",
  "fraud",
  "cancel my order",
  "cancel order",
  "bad food",
  "rude",
  "report you",
  "sue",
];

export function shouldBlockAIAutoReply(message: string) {
  const normalized = message.toLowerCase();

  return blockedKeywords.some((keyword) => normalized.includes(keyword));
}

export function getBlockedAIReason(message: string) {
  const normalized = message.toLowerCase();

  const matchedKeyword = blockedKeywords.find((keyword) =>
    normalized.includes(keyword)
  );

  if (matchedKeyword) {
    return `This message may require human attention. Matched keyword: ${matchedKeyword}`;
  }

  return null;
}
