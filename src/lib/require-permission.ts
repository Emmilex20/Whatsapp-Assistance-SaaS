import { redirect } from "next/navigation";
import { getCurrentTeamMember } from "@/lib/current-team-member";
import { hasPermission, type Permission } from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const member = await getCurrentTeamMember();

  if (!member || !hasPermission(member.role, permission)) {
    redirect("/dashboard/unauthorized");
  }

  return member;
}

export async function checkPermission(permission: Permission) {
  const member = await getCurrentTeamMember();

  return Boolean(member && hasPermission(member.role, permission));
}
