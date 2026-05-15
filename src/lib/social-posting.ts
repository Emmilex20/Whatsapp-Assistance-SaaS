import { prisma } from "@/lib/prisma";
import { isSocialAutoPostingSupported } from "@/lib/social-platforms";

type PublishCampaignPostParams = {
  postId: string;
};

type SocialPublishResult = {
  success: boolean;
  error?: string;
  url?: string;
};

export async function publishCampaignPostToSocial({
  postId,
}: PublishCampaignPostParams) {
  const post = await prisma.campaignPost.findUnique({
    where: {
      id: postId,
    },
    include: {
      campaign: true,
      socialAccount: true,
    },
  });

  if (!post) {
    return { success: false, error: "Scheduled post not found." };
  }

  if (!post.autoPostEnabled || post.autoPostPaused) {
    return { success: false, error: "Auto-posting is not active." };
  }

  if (!post.socialAccount) {
    return { success: false, error: "No social account selected." };
  }

  if (!post.socialAccount.postingEnabled || post.socialAccount.paused) {
    return { success: false, error: "Selected social account is paused." };
  }

  if (!isSocialAutoPostingSupported(post.socialAccount.provider)) {
    return {
      success: false,
      error:
        "This platform is manual-only in the current supported API flow.",
    };
  }

  const providerResult = await publishWithProviderStub({
    provider: post.socialAccount.provider,
    title: post.title,
    notes: post.notes,
    campaignTitle: post.campaign.title,
  });

  if (!providerResult.success) {
    return providerResult;
  }

  await prisma.campaignPost.update({
    where: {
      id: post.id,
    },
    data: {
      posted: true,
      postedAt: new Date(),
      autoPostedAt: new Date(),
      autoPostStatus: "POSTED",
      socialPostUrl: providerResult.url || null,
      completionNotes: `Auto-posted to ${post.socialAccount.displayName}.`,
    },
  });

  return providerResult;
}

async function publishWithProviderStub({
  provider,
}: {
  provider: string;
  title: string;
  notes: string | null;
  campaignTitle: string;
}): Promise<SocialPublishResult> {
  return {
    success: false,
    error: `${provider} posting provider is ready for OAuth/API wiring, but live publishing credentials are not configured yet.`,
  };
}

export async function processDueSocialCampaignPosts() {
  const duePosts = await prisma.campaignPost.findMany({
    where: {
      posted: false,
      autoPostEnabled: true,
      autoPostPaused: false,
      scheduledAt: {
        lte: new Date(),
      },
      socialAccount: {
        postingEnabled: true,
        paused: false,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: 20,
  });

  const results = [];

  for (const post of duePosts) {
    await prisma.campaignPost.update({
      where: {
        id: post.id,
      },
      data: {
        autoPostStatus: "PROCESSING",
        autoPostAttempts: {
          increment: 1,
        },
        autoPostError: null,
      },
    });

    const result = await publishCampaignPostToSocial({ postId: post.id });

    if (!result.success) {
      await prisma.campaignPost.update({
        where: {
          id: post.id,
        },
        data: {
          autoPostStatus: "FAILED",
          autoPostError: result.error,
        },
      });
    }

    results.push({
      postId: post.id,
      ...result,
    });
  }

  return results;
}
