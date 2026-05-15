const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "could",
  "do",
  "does",
  "for",
  "from",
  "have",
  "hello",
  "hi",
  "how",
  "i",
  "is",
  "it",
  "me",
  "my",
  "of",
  "please",
  "pls",
  "the",
  "to",
  "u",
  "we",
  "what",
  "when",
  "where",
  "you",
  "your",
]);

const synonymGroups = [
  ["address", "location", "located", "place", "shop", "branch", "landmark"],
  ["delivery", "deliver", "dispatch", "bring", "send", "drop"],
  ["fee", "price", "cost", "amount", "charge", "charges"],
  ["menu", "food", "meal", "meals", "dish", "dishes", "eat"],
  ["order", "buy", "want", "request", "purchase"],
  ["payment", "pay", "paid", "transfer", "cash", "pos", "account"],
  ["open", "opening", "close", "closing", "hours", "available"],
  ["human", "agent", "staff", "manager", "person", "someone"],
  ["complaint", "refund", "replace", "replacement", "cancel", "wrong"],
  ["promo", "discount", "offer", "deal", "special", "sales"],
  ["bulk", "catering", "party", "event", "office", "large"],
  ["reservation", "reserve", "booking", "book", "table"],
  ["status", "track", "tracking", "update"],
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/₦/g, " naira ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCanonicalToken(token: string) {
  const group = synonymGroups.find((items) => items.includes(token));

  return group?.[0] || token;
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .map(getCanonicalToken)
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function uniqueTokens(value: string) {
  return Array.from(new Set(tokenize(value)));
}

function levenshteinDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function tokensMatch(messageToken: string, candidateToken: string) {
  if (messageToken === candidateToken) return true;
  if (messageToken.length < 5 || candidateToken.length < 5) return false;

  return levenshteinDistance(messageToken, candidateToken) <= 1;
}

export function scoreIntentMatch(message: string, candidatePhrases: string[]) {
  const normalizedMessage = normalizeText(message);
  const messageTokens = uniqueTokens(message);

  if (!messageTokens.length) return 0;

  return candidatePhrases.reduce((bestScore, phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    const candidateTokens = uniqueTokens(phrase);

    if (!candidateTokens.length) return bestScore;

    if (
      normalizedPhrase.length >= 3 &&
      normalizedMessage.includes(normalizedPhrase)
    ) {
      return Math.max(bestScore, 1);
    }

    const matchedTokens = candidateTokens.filter((candidateToken) =>
      messageTokens.some((messageToken) =>
        tokensMatch(messageToken, candidateToken)
      )
    );

    const overlapScore = matchedTokens.length / candidateTokens.length;
    const coverageScore = matchedTokens.length / messageTokens.length;
    const balancedScore = overlapScore * 0.75 + coverageScore * 0.25;

    return Math.max(bestScore, balancedScore);
  }, 0);
}

export function findBestIntentMatch<T>({
  message,
  items,
  getPhrases,
  minimumScore,
}: {
  message: string;
  items: T[];
  getPhrases: (item: T) => string[];
  minimumScore: number;
}) {
  const scored = items
    .map((item) => ({
      item,
      score: scoreIntentMatch(message, getPhrases(item)),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  return best && best.score >= minimumScore ? best.item : null;
}
