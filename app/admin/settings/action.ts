"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  let settings = await prisma.setting.findFirst({
    include: {
      logoImage: true,
      faviconImage: true,
    },
  });

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        siteName: "Express Nepal",
        siteDescription: "Nepal's leading news portal",
      },
      include: {
        logoImage: true,
        faviconImage: true,
      },
    });
  }

  return {
    id: settings.id,
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    logoImageId: settings.logoImageId,
    logoUrl: settings.logoImage?.url || null,
    faviconImageId: settings.faviconImageId,
    faviconUrl: settings.faviconImage?.url || null,
  };
}

export async function updateSettings(formData: FormData) {
  const siteName = formData.get("siteName") as string;
  const siteDescription = formData.get("siteDescription") as string;
  const logoImageId = (formData.get("logoImageId") as string) || null;
  const faviconImageId = (formData.get("faviconImageId") as string) || null;

  if (!siteName || !siteDescription) {
    return { error: "Site name and description are required" };
  }

  let existing = await prisma.setting.findFirst();

  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: {
        siteName,
        siteDescription,
        logoImageId,
        faviconImageId,
      },
    });
  } else {
    await prisma.setting.create({
      data: {
        siteName,
        siteDescription,
        logoImageId,
        faviconImageId,
      },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true };
}
