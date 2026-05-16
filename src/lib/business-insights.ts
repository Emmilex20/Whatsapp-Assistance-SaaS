import { prisma } from "@/lib/prisma";
import { getMonthlyOperationsReport } from "@/lib/monthly-operations";
import { getWeeklyOperationsReport } from "@/lib/weekly-operations";

export type BusinessInsightPeriod = "WEEKLY" | "MONTHLY";
export type BusinessInsightCategory =
  | "revenue"
  | "customer"
  | "campaign"
  | "operations";
export type BusinessInsightPriority = "low" | "medium" | "high";

export type GeneratedBusinessInsight = {
  category: BusinessInsightCategory;
  title: string;
  summary: string;
  recommendation: string;
  metricLabel?: string;
  metricValue?: string | number;
  priority: BusinessInsightPriority;
};

function formatMoney(value: number) {
  return `NGN ${value.toLocaleString()}`;
}

function formatHour(hour: number | null) {
  if (hour === null) return "Not enough order data";

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
  }).format(new Date(2026, 0, 1, hour));
}

function percent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function buildPeakHour(orders: { createdAt: Date }[]) {
  const hourCounts = new Map<number, number>();

  for (const order of orders) {
    const hour = order.createdAt.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }

  const peak = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    hour: peak?.[0] ?? null,
    count: peak?.[1] ?? 0,
  };
}

function buildBestSellingItems(
  orders: {
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[]
) {
  const itemStats = new Map<
    string,
    {
      quantity: number;
      revenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = itemStats.get(item.name) || {
        quantity: 0,
        revenue: 0,
      };

      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.price;
      itemStats.set(item.name, existing);
    }
  }

  return [...itemStats.entries()]
    .map(([name, stats]) => ({
      name,
      ...stats,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

export async function generateBusinessInsights(
  restaurantId: string,
  period: BusinessInsightPeriod = "WEEKLY"
) {
  const monthlyReport =
    period === "MONTHLY"
      ? await getMonthlyOperationsReport(restaurantId)
      : null;
  const report =
    monthlyReport || (await getWeeklyOperationsReport(restaurantId));

  const [orders, activeMemories, complaints] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: report.start,
          lte: report.end,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.customerMemory.count({
      where: {
        restaurantId,
        active: true,
        reviewStatus: "APPROVED",
      },
    }),
    prisma.complaintAlert.count({
      where: {
        restaurantId,
        createdAt: {
          gte: report.start,
          lte: report.end,
        },
      },
    }),
  ]);

  const bestSellingItems = buildBestSellingItems(orders);
  const peakHour = buildPeakHour(orders);
  const uniqueCustomers = new Set(orders.map((order) => order.customerPhone));
  const customerOrderCounts = new Map<string, number>();

  for (const order of orders) {
    customerOrderCounts.set(
      order.customerPhone,
      (customerOrderCounts.get(order.customerPhone) || 0) + 1
    );
  }

  const repeatCustomers = [...customerOrderCounts.values()].filter(
    (count) => count > 1
  ).length;
  const averageOrderValue = orders.length
    ? Math.round(report.revenue / orders.length)
    : 0;
  const conversionRate = report.messages
    ? (orders.length / report.messages) * 100
    : 0;
  const topCampaign = report.topCampaigns[0];
  const insights: GeneratedBusinessInsight[] = [];

  insights.push({
    category: "revenue",
    title: orders.length ? "Revenue is tied to order volume" : "No paid orders yet",
    summary: `${period.toLowerCase()} revenue is ${formatMoney(
      report.revenue
    )} from ${orders.length} valid order${orders.length === 1 ? "" : "s"}.`,
    recommendation: orders.length
      ? `Protect the ${formatMoney(
          averageOrderValue
        )} average order value by keeping popular items available and delivery fees clear.`
      : "Add menu items, test the order flow, and make sure customers can quickly move from menu questions to checkout.",
    metricLabel: "Average order value",
    metricValue: formatMoney(averageOrderValue),
    priority: orders.length ? "medium" : "high",
  });

  insights.push({
    category: "revenue",
    title: bestSellingItems.length
      ? `${bestSellingItems[0].name} is leading sales`
      : "Best sellers need more data",
    summary: bestSellingItems.length
      ? `${bestSellingItems[0].name} sold ${bestSellingItems[0].quantity} unit${
          bestSellingItems[0].quantity === 1 ? "" : "s"
        } in this period.`
      : "There are not enough order items yet to identify a clear best seller.",
    recommendation: bestSellingItems.length
      ? "Feature this item in WhatsApp replies, campaign posts, and upsell suggestions while demand is visible."
      : "Let a few real orders run through the system, then review which foods deserve promotion.",
    metricLabel: "Top item revenue",
    metricValue: bestSellingItems.length
      ? formatMoney(bestSellingItems[0].revenue)
      : formatMoney(0),
    priority: bestSellingItems.length ? "medium" : "low",
  });

  insights.push({
    category: "customer",
    title: "Customer behavior signal",
    summary: `${uniqueCustomers.size} unique customer${
      uniqueCustomers.size === 1 ? "" : "s"
    } placed orders, with ${repeatCustomers} repeat customer${
      repeatCustomers === 1 ? "" : "s"
    } detected.`,
    recommendation: repeatCustomers
      ? "Use customer memory and short follow-ups to personalize repeat orders without asking the same questions again."
      : "Encourage first-time buyers to reorder by sending clear menu, delivery, and payment guidance.",
    metricLabel: "Chat to order rate",
    metricValue: percent(conversionRate),
    priority: conversionRate < 10 && report.messages > 10 ? "high" : "medium",
  });

  insights.push({
    category: "customer",
    title: "Personalization coverage",
    summary: `${activeMemories} approved customer memor${
      activeMemories === 1 ? "y" : "ies"
    } are available for AI context.`,
    recommendation: activeMemories
      ? "Keep approving useful preferences so replies can mention delivery habits, favorite meals, and spice choices naturally."
      : "Start approving customer memories after real chats so the AI can personalize future replies.",
    metricLabel: "Approved memories",
    metricValue: activeMemories,
    priority: activeMemories ? "low" : "medium",
  });

  insights.push({
    category: "campaign",
    title: topCampaign ? "Top campaign performance" : "Campaign performance is empty",
    summary: topCampaign
      ? `${topCampaign.title} is currently the strongest campaign with ${formatMoney(
          topCampaign.revenueGenerated
        )} tracked revenue.`
      : "No campaign has recorded meaningful performance yet.",
    recommendation: topCampaign
      ? "Reuse the winning offer structure and assign follow-up posts before demand cools down."
      : "Create one small campaign with scheduled posts and track inquiries, orders, and revenue.",
    metricLabel: topCampaign ? "Campaign orders" : "Campaign posts",
    metricValue: topCampaign
      ? topCampaign.ordersGenerated
      : report.campaignPosts.length,
    priority: topCampaign ? "medium" : "low",
  });

  insights.push({
    category: "campaign",
    title: report.missedPosts.length
      ? "Missed campaign posts need attention"
      : "Campaign posting discipline looks healthy",
    summary: `${report.postedPosts.length} campaign post${
      report.postedPosts.length === 1 ? "" : "s"
    } completed and ${report.missedPosts.length} missed in this period.`,
    recommendation: report.missedPosts.length
      ? "Assign overdue posts to a team member and review the posting calendar before the next campaign push."
      : "Keep using assignments and reminders so campaign posts continue going out on schedule.",
    metricLabel: "Missed posts",
    metricValue: report.missedPosts.length,
    priority: report.missedPosts.length ? "high" : "low",
  });

  insights.push({
    category: "operations",
    title: peakHour.hour === null ? "Peak order time unavailable" : "Peak order time",
    summary:
      peakHour.hour === null
        ? "There are not enough orders yet to identify a peak ordering window."
        : `${formatHour(peakHour.hour)} had the highest order activity with ${
            peakHour.count
          } order${peakHour.count === 1 ? "" : "s"}.`,
    recommendation:
      peakHour.hour === null
        ? "Once real orders arrive, staff planning can be tuned around peak ordering windows."
        : "Make sure staff are available around this time and keep high-demand menu items ready.",
    metricLabel: "Peak hour",
    metricValue: formatHour(peakHour.hour),
    priority: peakHour.count > 3 ? "medium" : "low",
  });

  insights.push({
    category: "operations",
    title: complaints ? "Complaint pressure detected" : "Complaint volume is calm",
    summary: `${complaints} complaint alert${
      complaints === 1 ? "" : "s"
    } were created in this period.`,
    recommendation: complaints
      ? "Review flagged conversations, resolve customer issues manually, and update policies if the same issue repeats."
      : "Keep monitoring complaint alerts and human takeover so difficult chats do not stay automated.",
    metricLabel: "Complaint alerts",
    metricValue: complaints,
    priority: complaints > 2 ? "high" : complaints ? "medium" : "low",
  });

  if (monthlyReport) {
    insights.push({
      category: "operations",
      title: "AI and media cost awareness",
      summary: `AI logged ${monthlyReport.ai.events} event${
        monthlyReport.ai.events === 1 ? "" : "s"
      } and media generated ${monthlyReport.media.generations} asset${
        monthlyReport.media.generations === 1 ? "" : "s"
      } this month.`,
      recommendation:
        "Keep AI and media generation tied to real business tasks so monthly cost stays intentional.",
      metricLabel: "Estimated AI cost",
      metricValue: `$${monthlyReport.ai.cost.toFixed(4)}`,
      priority:
        monthlyReport.ai.cost + monthlyReport.media.cost > 10
          ? "high"
          : "low",
    });
  }

  return {
    period,
    start: report.start,
    end: report.end,
    insights,
  };
}
