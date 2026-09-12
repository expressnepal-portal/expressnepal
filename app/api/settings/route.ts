import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json({
      id: settings.id,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logoImageId: settings.logoImageId,
      logoUrl: settings.logoImage?.url || null,
      faviconImageId: settings.faviconImageId,
      faviconUrl: settings.faviconImage?.url || null,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const siteName = formData.get("siteName") as string;
    const siteDescription = formData.get("siteDescription") as string;
    const logoImageId = (formData.get("logoImageId") as string) || null;
    const faviconImageId = (formData.get("faviconImageId") as string) || null;

    if (!siteName || !siteDescription) {
      return NextResponse.json(
        { error: "Site name and description are required" },
        { status: 400 }
      );
    }

    let existing = await prisma.setting.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.setting.update({
        where: { id: existing.id },
        data: {
          siteName,
          siteDescription,
          logoImageId,
          faviconImageId,
        },
        include: {
          logoImage: true,
          faviconImage: true,
        },
      });
    } else {
      updated = await prisma.setting.create({
        data: {
          siteName,
          siteDescription,
          logoImageId,
          faviconImageId,
        },
        include: {
          logoImage: true,
          faviconImage: true,
        },
      });
    }

    return NextResponse.json({
      id: updated.id,
      siteName: updated.siteName,
      siteDescription: updated.siteDescription,
      logoImageId: updated.logoImageId,
      logoUrl: updated.logoImage?.url || null,
      faviconImageId: updated.faviconImageId,
      faviconUrl: updated.faviconImage?.url || null,
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
