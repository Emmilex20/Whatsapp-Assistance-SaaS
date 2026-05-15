type TeamRole = "OWNER" | "MANAGER" | "AGENT" | "MARKETER";

const permissions = {
  OWNER: [
    "manage_billing",
    "manage_settings",
    "manage_team",
    "manage_whatsapp",
    "manage_ai",
    "manage_reports",
    "manage_campaigns",
    "manage_media",
    "manage_orders",
    "manage_inbox",
  ],
  MANAGER: [
    "manage_team",
    "manage_reports",
    "manage_campaigns",
    "manage_media",
    "manage_orders",
    "manage_inbox",
  ],
  AGENT: ["manage_orders", "manage_inbox"],
  MARKETER: ["manage_campaigns", "manage_media", "manage_reports"],
} as const;

export type Permission =
  (typeof permissions)[keyof typeof permissions][number];

export function hasPermission(
  role: string | null | undefined,
  permission: Permission
) {
  if (!role) return false;

  const normalizedRole = role as TeamRole;

  return (
    permissions[normalizedRole]?.some((item) => item === permission) || false
  );
}
