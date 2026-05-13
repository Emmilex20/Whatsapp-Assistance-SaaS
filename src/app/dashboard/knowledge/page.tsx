import { BookOpen, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import {
  deleteKnowledgeBaseItem,
  toggleKnowledgeBaseItem,
} from "@/actions/knowledge";
import { CreateKnowledgeForm } from "@/components/knowledge/create-knowledge-form";
import { Button } from "@/components/ui/button";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

export default async function KnowledgePage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const items = restaurant
    ? await prisma.knowledgeBaseItem.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">
          AI knowledge base
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Restaurant knowledge
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Add custom facts, policies, delivery instructions, payment rules, and
          business-specific details that AI suggestions should follow.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <CreateKnowledgeForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">
            Saved knowledge
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Active items are included in AI context.
          </p>

          <div className="mt-5 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-400">
                No knowledge items yet. Add policies, payment notes, or delivery
                instructions to improve AI suggestions.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpen size={15} className="text-emerald-400" />

                        <h3 className="text-sm font-semibold text-white">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.active
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-zinc-400/10 text-zinc-300"
                          }`}
                        >
                          {item.active ? "Active" : "Paused"}
                        </span>

                        {item.category && (
                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <form action={toggleKnowledgeBaseItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(item.active)}
                        />

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                        >
                          {item.active ? (
                            <PauseCircle size={14} />
                          ) : (
                            <PlayCircle size={14} />
                          )}
                        </Button>
                      </form>

                      <form action={deleteKnowledgeBaseItem}>
                        <input type="hidden" name="id" value={item.id} />

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-full border-red-400/20 bg-red-400/10 px-3 text-xs text-red-300 hover:bg-red-400/20"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
        <h2 className="text-base font-semibold text-white">
          Knowledge base safety
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-100">
          Add only facts the restaurant wants the AI to use. If a policy
          changes, update or pause the old item immediately so AI suggestions
          stay accurate.
        </p>
      </section>
    </div>
  );
}
