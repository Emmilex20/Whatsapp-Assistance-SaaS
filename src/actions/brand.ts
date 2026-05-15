"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/require-permission";

const allowedLogoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getLogoExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase().replace(".", "");

  if (extension) return extension;

  return file.type.split("/")[1] || "png";
}

async function saveBrandLogo(file: File) {
  if (!allowedLogoTypes.has(file.type)) {
    return { error: "Logo must be a JPG, PNG, WebP, or GIF image." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "Logo file must be 2MB or smaller." };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "brand");
  const filename = `${randomUUID()}.${getLogoExtension(file)}`;
  const uploadPath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, Buffer.from(bytes));

  return { url: `/uploads/brand/${filename}` };
}

export async function updateBrandKit(formData: FormData) {
  const allowed = await checkPermission("manage_media");

  if (!allowed) {
    return { error: "You do not have permission to manage brand media." };
  }

  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const logoFile = formData.get("brandLogoFile");
  let brandLogoUrl = String(formData.get("brandLogoUrl") || "").trim();

  if (logoFile instanceof File && logoFile.size > 0) {
    const savedLogo = await saveBrandLogo(logoFile);

    if (savedLogo.error) {
      return { error: savedLogo.error };
    }

    brandLogoUrl = savedLogo.url || brandLogoUrl;
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      brandPrimaryColor: String(
        formData.get("brandPrimaryColor") || ""
      ).trim(),
      brandSecondaryColor: String(
        formData.get("brandSecondaryColor") || ""
      ).trim(),
      brandSlogan: String(formData.get("brandSlogan") || "").trim(),
      brandTone: String(formData.get("brandTone") || "").trim(),
      brandLogoUrl,
      brandVisualStyle: String(formData.get("brandVisualStyle") || "").trim(),
    },
  });

  revalidatePath("/dashboard/brand");
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/settings/ai/context");

  return { success: "Brand kit updated successfully." };
}
