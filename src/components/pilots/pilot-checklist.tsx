import { CheckCircle2, Circle } from "lucide-react";
import { togglePilotChecklistItem } from "@/actions/pilot";
import { Button } from "@/components/ui/button";

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

type PilotChecklistProps = {
  pilotId: string;
  items: ChecklistItem[];
};

export function PilotChecklist({ pilotId, items }: PilotChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const progress = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Client setup checklist
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track what is left before this pilot can go live.
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          {progress}%
        </span>
      </div>

      <div className="mb-5 h-2 rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <form
            key={item.id}
            action={togglePilotChecklistItem}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
          >
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="pilotId" value={pilotId} />
            <input
              type="hidden"
              name="completed"
              value={String(item.completed)}
            />

            <div className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={18} className="text-zinc-500" />
              )}

              <p
                className={`text-sm ${
                  item.completed ? "text-zinc-500 line-through" : "text-white"
                }`}
              >
                {item.title}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
            >
              {item.completed ? "Undo" : "Done"}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
