type ReminderDraftPost = {
  title: string;
  platform: string;
  scheduledAt: Date;
  notes: string | null;
  campaign: {
    title: string;
  };
};

export function buildCampaignReminderDraft(post: ReminderDraftPost) {
  const scheduled = post.scheduledAt.toLocaleString();

  const whatsapp = `Reminder: ${post.title}

Campaign: ${post.campaign.title}
Platform: ${post.platform}
Scheduled time: ${scheduled}

${post.notes ? `Notes: ${post.notes}` : "Please post the prepared campaign asset and caption."}`;

  const email = `Subject: Campaign post reminder - ${post.title}

Hi,

This is a reminder to publish the scheduled campaign post.

Campaign: ${post.campaign.title}
Post: ${post.title}
Platform: ${post.platform}
Scheduled time: ${scheduled}

${post.notes ? `Notes: ${post.notes}` : "Please use the campaign image and caption pack prepared in ServeFlow."}

After posting, mark it as posted in the campaign calendar.`;

  return {
    whatsapp,
    email,
  };
}
