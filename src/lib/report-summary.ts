type ReportSummaryInput = {
  restaurantName: string;
  periodLabel: string;
  messages: number;
  orders: number;
  revenue: number;
  campaignPosts: number;
  missedPosts: number;
  aiEvents?: number;
  mediaAssets?: number;
};

export function buildReportSharingNotes({
  restaurantName,
  periodLabel,
  messages,
  orders,
  revenue,
  campaignPosts,
  missedPosts,
  aiEvents = 0,
  mediaAssets = 0,
}: ReportSummaryInput) {
  const whatsapp = `Hi, here is the ${periodLabel} summary for ${restaurantName}:

Messages: ${messages}
Orders: ${orders}
Revenue: ₦${revenue.toLocaleString()}
Campaign posts: ${campaignPosts}
Missed posts: ${missedPosts}

${missedPosts > 0 ? "Some campaign posts were missed, so the posting calendar should be reviewed." : "No missed campaign posts were detected."}`;

  const email = `Subject: ${restaurantName} ${periodLabel} Operations Report

Hello,

Here is the ${periodLabel} operations summary for ${restaurantName}.

Messages handled: ${messages}
Orders recorded: ${orders}
Revenue recorded: ₦${revenue.toLocaleString()}
Campaign posts scheduled: ${campaignPosts}
Missed campaign posts: ${missedPosts}
AI events: ${aiEvents}
Media assets generated: ${mediaAssets}

${missedPosts > 0 ? "Recommendation: review the posting calendar and assign posts clearly to staff before the next campaign period." : "Good progress: no missed campaign posts were detected for this period."}

Regards.`;

  return {
    whatsapp,
    email,
  };
}
