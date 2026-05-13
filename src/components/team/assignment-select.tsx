type AssignmentSelectProps = {
  name: string;
  defaultValue?: string | null;
  teamMembers: {
    id: string;
    name: string | null;
    email: string;
  }[];
};

export function AssignmentSelect({
  name,
  defaultValue,
  teamMembers,
}: AssignmentSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className="h-9 rounded-full border border-white/10 bg-zinc-900 px-3 text-xs text-white outline-none"
    >
      <option value="">Unassigned</option>
      {teamMembers.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name || member.email}
        </option>
      ))}
    </select>
  );
}
