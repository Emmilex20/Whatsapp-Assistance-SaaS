export const socialPlatforms = [
  {
    value: "WHATSAPP_STATUS",
    label: "WhatsApp Status",
    autoPostingSupported: false,
    note: "WhatsApp Cloud API does not provide normal Status publishing. Use copy-ready/manual posting.",
  },
  {
    value: "FACEBOOK",
    label: "Facebook Page",
    autoPostingSupported: true,
    note: "Requires Meta page publishing permissions.",
  },
  {
    value: "INSTAGRAM",
    label: "Instagram Business",
    autoPostingSupported: true,
    note: "Requires Instagram Business/Creator account connected to a Facebook Page.",
  },
  {
    value: "X",
    label: "X / Twitter",
    autoPostingSupported: true,
    note: "Requires X API access and posting permissions.",
  },
  {
    value: "TIKTOK",
    label: "TikTok",
    autoPostingSupported: true,
    note: "Requires TikTok app approval and content publishing permissions.",
  },
  {
    value: "OTHER",
    label: "Other",
    autoPostingSupported: false,
    note: "Manual posting recommended.",
  },
] as const;

export function getSocialPlatformLabel(platform: string) {
  return (
    socialPlatforms.find((item) => item.value === platform)?.label || platform
  );
}

export function isSocialAutoPostingSupported(platform: string) {
  return Boolean(
    socialPlatforms.find((item) => item.value === platform)
      ?.autoPostingSupported
  );
}
