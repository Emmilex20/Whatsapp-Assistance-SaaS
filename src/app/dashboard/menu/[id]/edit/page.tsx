import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { updateMenuItem } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMenuItemPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getOrCreateCurrentRestaurant();

  const item = restaurant
    ? await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId: restaurant.id,
        },
      })
    : null;

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/dashboard/menu"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to menu
        </Link>

        <p className="text-sm font-medium text-emerald-400">Edit menu item</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Update food item
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Update the name, category, and price customers will see through WhatsApp.
        </p>
      </section>

      <form
        action={updateMenuItem}
        className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <input type="hidden" name="id" value={item.id} />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Food name</label>
            <Input
              name="name"
              required
              defaultValue={item.name}
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Category</label>
            <Input
              name="category"
              defaultValue={item.category || ""}
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Price in naira</label>
            <Input
              name="price"
              required
              type="number"
              defaultValue={item.price}
              className="h-11 rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
          </div>
        </div>

        <Button className="mt-6 h-10 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400">
          Save changes
        </Button>
      </form>
    </div>
  );
}
