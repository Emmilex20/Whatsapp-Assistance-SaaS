import { prisma } from "@/lib/prisma";

export async function getCampaignAnalytics(restaurantId: string) {
  const campaigns = await prisma.promoCampaign.findMany({
    where: { restaurantId },
  });

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "ACTIVE"
  ).length;

  const totalImpressions = campaigns.reduce(
    (sum, campaign) => sum + campaign.impressions,
    0
  );

  const totalInquiries = campaigns.reduce(
    (sum, campaign) => sum + campaign.whatsappInquiries,
    0
  );

  const totalOrders = campaigns.reduce(
    (sum, campaign) => sum + campaign.ordersGenerated,
    0
  );

  const totalRevenue = campaigns.reduce(
    (sum, campaign) => sum + campaign.revenueGenerated,
    0
  );

  const inquiryRate = totalImpressions
    ? Math.round((totalInquiries / totalImpressions) * 100)
    : 0;

  return {
    totalCampaigns,
    activeCampaigns,
    totalImpressions,
    totalInquiries,
    totalOrders,
    totalRevenue,
    inquiryRate,
  };
}
