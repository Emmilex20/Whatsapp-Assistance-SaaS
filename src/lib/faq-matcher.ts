import { findBestIntentMatch } from "@/lib/customer-intent";
import { prisma } from "@/lib/prisma";

type MatchFAQParams = {
  restaurantId: string;
  message: string;
};

export async function matchFAQ({ restaurantId, message }: MatchFAQParams) {
  const faqs = await prisma.fAQ.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
  });

  return findBestIntentMatch({
    message,
    items: faqs,
    getPhrases: (faq) => [faq.question, faq.answer],
    minimumScore: 0.48,
  });
}
