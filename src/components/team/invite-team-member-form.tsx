"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { inviteTeamMember } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  success: "",
  error: "",
};

export function InviteTeamMemberForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await inviteTeamMember(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
      };
    },
    initialState
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <UserPlus size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Invite team member
          </h2>
          <p className="text-sm text-zinc-500">
            Add staff who can later help manage inbox and orders.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Name</label>
          <Input
            name="name"
            placeholder="Amaka"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Email</label>
          <Input
            name="email"
            type="email"
            required
            placeholder="staff@example.com"
            className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Role</label>
          <select
            name="role"
            defaultValue="AGENT"
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option value="AGENT">Agent</option>
            <option value="MANAGER">Manager</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>

        <Button
          disabled={pending}
          className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Inviting..." : "Invite member"}
        </Button>
      </div>
    </form>
  );
}
