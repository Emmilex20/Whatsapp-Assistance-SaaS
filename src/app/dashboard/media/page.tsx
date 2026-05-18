import Link from "next/link";
import { ImageIcon, Palette } from "lucide-react";
import { AttachToCampaignForm } from "@/components/media/attach-to-campaign-form";
import { CopyCaptionButton } from "@/components/media/copy-caption-button";
import { DeleteMediaButton } from "@/components/media/delete-media-button";
import { FavoriteMediaButton } from "@/components/media/favorite-media-button";
import { GenerateCaptionButton } from "@/components/media/generate-caption-button";
import { MediaFilterBar } from "@/components/media/media-filter-bar";
import { ReusePromptButton } from "@/components/media/reuse-prompt-button";
import { CreatePromoImageForm } from "@/components/media/create-promo-image-form";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { mediaPromptTemplates } from "@/lib/media/templates";
import { getMonthlyMediaUsage } from "@/lib/media/usage-limits";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-permission";

type MediaPageProps = {
  searchParams: Promise<{
    template?: string;
    status?: string;
    favorite?: string;
    caption?: string;
  }>;
};

export default async function MediaPage({ searchParams }: MediaPageProps) {
  await requirePermission("manage_media");

  const params = await searchParams;
  const templateFilter = params.template || "all";
  const statusFilter = params.status || "all";
  const favoriteFilter = params.favorite || "all";
  const captionFilter = params.caption || "all";
  const restaurant = await getOrCreateCurrentRestaurant();

  const generations = restaurant
    ? await prisma.mediaGeneration.findMany({
        where: {
          restaurantId: restaurant.id,
          ...(templateFilter !== "all" ? { templateType: templateFilter } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(favoriteFilter === "favorites" ? { favorite: true } : {}),
          ...(captionFilter === "with_caption"
            ? { caption: { not: null } }
            : captionFilter === "without_caption"
              ? { caption: null }
              : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];
  const mediaUsage = restaurant
    ? await getMonthlyMediaUsage(restaurant.id)
    : null;
  const campaigns = restaurant
    ? await prisma.promoCampaign.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-400">Media tools</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Restaurant promo images
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Generate simple promotional images for restaurants. This uses
          Replicate and is separate from WhatsApp AI replies.
        </p>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Palette size={18} className="mt-1 text-blue-200" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Improve promo consistency
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Add brand colors, slogan, and visual style before generating
                media.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/brand"
            className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Open brand kit
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {mediaPromptTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm font-semibold text-white">{template.name}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {template.description}
            </p>
          </div>
        ))}
      </section>

      <MediaFilterBar
        templateFilter={templateFilter}
        statusFilter={statusFilter}
        favoriteFilter={favoriteFilter}
        captionFilter={captionFilter}
      />

      {mediaUsage && (
        <section className="grid gap-4 md:grid-cols-2">
          {[
            {
              label: "Media generations",
              value: mediaUsage.usage.totalGenerations,
              limit: mediaUsage.limits.monthlyMediaGenerations,
            },
            {
              label: "Estimated media cost",
              value: mediaUsage.usage.totalCost,
              limit: mediaUsage.limits.monthlyMediaCostLimit,
              money: true,
            },
          ].map((item) => {
            const percent = Math.min((item.value / item.limit) * 100, 100);

            return (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-sm text-zinc-500">{item.label}</p>

                <div className="mt-2 flex items-end gap-1">
                  <h2 className="text-2xl font-semibold text-white">
                    {item.money
                      ? `$${item.value.toFixed(3)}`
                      : item.value.toLocaleString()}
                  </h2>

                  <span className="mb-1 text-sm text-zinc-500">
                    /{" "}
                    {item.money
                      ? `$${item.limit}`
                      : item.limit.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <CreatePromoImageForm />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold text-white">Media gallery</h2>

          <p className="mt-1 text-sm text-zinc-500">
            View, reuse, and manage generated restaurant promo assets.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {generations.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState
                  icon={ImageIcon}
                  title="No media assets found"
                  description="No promo images match this filter. Generate a new promo image or clear the gallery filters."
                  actionLabel="View all media"
                  actionHref="/dashboard/media"
                />
              </div>
            ) : (
              generations.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70"
                >
                  {item.outputUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.outputUrl}
                      alt="Generated restaurant promo"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-zinc-950 text-sm text-zinc-500">
                      No image output
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                        {item.status}
                      </span>

                      {item.templateType && (
                        <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                          {item.templateType.replaceAll("_", " ")}
                        </span>
                      )}

                      {item.favorite && (
                        <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs text-pink-300">
                          Favorite
                        </span>
                      )}

                      {item.campaignId && (
                        <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                          In campaign
                        </span>
                      )}

                      <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                        ${item.estimatedCost.toFixed(3)}
                      </span>
                    </div>

                    <p className="line-clamp-4 break-words text-sm leading-6 text-zinc-400">
                      {item.prompt}
                    </p>

                    {item.caption && (
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-emerald-300">
                          Caption
                        </p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-200">
                          {item.caption}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <FavoriteMediaButton
                        id={item.id}
                        favorite={item.favorite}
                      />

                      <DeleteMediaButton id={item.id} />

                      <GenerateCaptionButton mediaGenerationId={item.id} />

                      {item.caption && (
                        <CopyCaptionButton caption={item.caption} />
                      )}

                      {item.outputUrl && (
                        <>
                          <a
                            href={item.outputUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center rounded-full bg-emerald-500 px-4 text-xs font-medium text-white hover:bg-emerald-400"
                          >
                            Open image
                          </a>

                          <a
                            href={item.outputUrl}
                            download
                            className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white hover:bg-white/10"
                          >
                            Download
                          </a>
                        </>
                      )}

                      <ReusePromptButton prompt={item.prompt} />
                    </div>

                    <AttachToCampaignForm
                      mediaId={item.id}
                      campaigns={campaigns}
                    />

                    <p className="text-xs text-zinc-600">
                      {item.createdAt.toLocaleString()}
                    </p>
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
