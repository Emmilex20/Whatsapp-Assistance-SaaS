import Link from "next/link";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMenuItem } from "@/actions/restaurant";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateMenuItemForm } from "@/components/menu/create-menu-item-form";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

export default async function MenuPage() {
  const restaurant = await getOrCreateCurrentRestaurant();

  const menuItems = restaurant
    ? await prisma.menuItem.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Restaurant menu</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Menu items
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Add food items your WhatsApp assistant can send when customers ask for menu or prices.
          </p>
        </div>

        <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          <Plus className="mr-2" size={16} />
          Add menu item
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <CreateMenuItemForm />

        <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Current menu</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Items customers can request through WhatsApp.
              </p>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <Input
                placeholder="Search menu..."
                className="h-10 rounded-full border-white/10 bg-zinc-900 pl-9 text-sm text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {menuItems.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No menu items yet"
                description="Add your first food item so customers can request your real menu through WhatsApp."
                action="Use form to add item"
              />
            ) : (
              menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-white">
                      ₦{item.price.toLocaleString()}
                    </p>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                    <Link href={`/dashboard/menu/${item.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs text-white hover:bg-white/10"
                      >
                        <Edit3 size={14} />
                      </Button>
                    </Link>
                    <form action={deleteMenuItem}>
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
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
