"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageIcon, Save, Sparkles } from "lucide-react";
import {
  generateAICampaignDraft,
  GeneratedCampaignActionState,
  saveGeneratedCampaign,
} from "@/actions/ai-campaign-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialGenerateState: GeneratedCampaignActionState = {
  success: "",
  error: "",
};

const initialSaveState = {
  success: "",
  error: "",
  campaignId: "",
};

const fieldClass =
  "h-11 w-full rounded-2xl border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600";
const textareaClass =
  "min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600";

export function AICampaignGeneratorForm() {
  const [generateState, generateAction, generating] = useActionState(
    async (_prev: GeneratedCampaignActionState, formData: FormData) => {
      return generateAICampaignDraft(formData);
    },
    initialGenerateState
  );

  const [saveState, saveAction, saving] = useActionState(
    async (_prev: typeof initialSaveState, formData: FormData) => {
      const result = await saveGeneratedCampaign(formData);

      return {
        success: result?.success || "",
        error: result?.error || "",
        campaignId: result?.campaignId || "",
      };
    },
    initialSaveState
  );

  useEffect(() => {
    if (generateState.success) toast.success(generateState.success);
    if (generateState.error) toast.error(generateState.error);
  }, [generateState]);

  useEffect(() => {
    if (saveState.success) toast.success(saveState.success);
    if (saveState.error) toast.error(saveState.error);
  }, [saveState]);

  const draft = generateState.draft;
  const input = generateState.input;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <form
        action={generateAction}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Sparkles size={18} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Campaign inputs
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Give the AI a clear direction, then edit the draft before saving.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            name="goal"
            required
            defaultValue={input?.goal}
            placeholder="Increase weekend burger orders"
            className={fieldClass}
          />

          <Input
            name="targetAudience"
            required
            defaultValue={input?.targetAudience}
            placeholder="Students, office workers, returning customers"
            className={fieldClass}
          />

          <select
            name="promotionType"
            required
            defaultValue={input?.promotionType || "Combo offer"}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>Combo offer</option>
            <option>Weekend promo</option>
            <option>New menu item</option>
            <option>Delivery push</option>
            <option>Flash sale</option>
            <option>Loyalty reminder</option>
          </select>

          <select
            name="tone"
            required
            defaultValue={input?.tone || "Warm and persuasive"}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>Warm and persuasive</option>
            <option>Playful</option>
            <option>Premium</option>
            <option>Urgent</option>
            <option>Family-friendly</option>
            <option>Simple and direct</option>
          </select>

          <select
            name="platform"
            required
            defaultValue={input?.platform || "WhatsApp + Instagram"}
            className="h-11 w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none"
          >
            <option>WhatsApp + Instagram</option>
            <option>WhatsApp Status</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>TikTok</option>
            <option>All platforms</option>
          </select>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
            <p className="text-sm font-medium text-white">Cost estimate</p>
            <p className="mt-1 text-sm leading-6 text-blue-100">
              Text generation usually costs less than $0.01 with the configured
              mini model. Optional image generation uses your media limits.
            </p>
          </div>

          <Button
            disabled={generating}
            className="h-10 w-full rounded-full bg-emerald-500 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
          >
            <Sparkles className="mr-2" size={16} />
            {generating ? "Generating..." : "Generate campaign"}
          </Button>
        </div>
      </form>

      <form
        action={saveAction}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Editable campaign draft
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Review every line before saving it into campaigns.
            </p>
          </div>

          {generateState.estimatedCost !== undefined && (
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              AI cost: ${generateState.estimatedCost.toFixed(6)}
            </span>
          )}
        </div>

        {!draft ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-sm leading-6 text-zinc-400">
            Generate a campaign first. The draft will appear here with title,
            captions, hashtags, and call-to-action ready for editing.
          </div>
        ) : (
          <div className="space-y-4">
            <input type="hidden" name="goal" value={input?.goal || ""} />
            <input
              type="hidden"
              name="targetAudience"
              value={input?.targetAudience || ""}
            />
            <input
              type="hidden"
              name="promotionType"
              value={input?.promotionType || ""}
            />
            <input type="hidden" name="platform" value={input?.platform || ""} />

            <Input
              name="title"
              required
              defaultValue={draft.title}
              className={fieldClass}
            />

            <textarea
              name="caption"
              required
              defaultValue={draft.caption}
              className={textareaClass}
            />

            <textarea
              name="whatsappText"
              required
              defaultValue={draft.whatsappText}
              className={textareaClass}
            />

            <textarea
              name="instagramText"
              required
              defaultValue={draft.instagramText}
              className={textareaClass}
            />

            <Input
              name="hashtags"
              defaultValue={draft.hashtags.join(" ")}
              className={fieldClass}
            />

            <Input
              name="callToAction"
              defaultValue={draft.callToAction}
              className={fieldClass}
            />

            <textarea
              name="imagePrompt"
              defaultValue={draft.imagePrompt}
              className={textareaClass}
            />

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="generateImage"
                className="mt-1 h-4 w-4 rounded border-white/10 bg-zinc-900"
              />
              <span>
                <span className="flex items-center gap-2 font-medium text-white">
                  <ImageIcon size={15} className="text-emerald-400" />
                  Generate promo image too
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  Uses the existing media generation system, limits, and
                  Replicate settings.
                </span>
              </span>
            </label>

            <div className="action-row no-scrollbar">
              <Button
                disabled={saving}
                className="h-10 shrink-0 rounded-full bg-emerald-500 px-5 text-sm text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                <Save className="mr-2" size={16} />
                {saving ? "Saving..." : "Save to campaigns"}
              </Button>

              {saveState.campaignId && (
                <Link
                  href={`/dashboard/campaigns/${saveState.campaignId}`}
                  className="inline-flex h-10 shrink-0 items-center rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Open saved campaign
                </Link>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
