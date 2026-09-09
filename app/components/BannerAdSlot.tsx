import { prisma } from "@/lib/prisma";

interface BannerAdSlotProps {
  /** Index of the ad to display from active CMS ads array (default: 0) */
  index?: number;
  /** Optional fallback image static path if no CMS ad exists at this index */
  fallbackImage?: string;
  /** Optional fallback link if using static fallback image */
  fallbackLink?: string;
  /** Custom container class */
  className?: string;
}

export default async function BannerAdSlot({
  index = 0,
  fallbackImage,
  fallbackLink = "#",
  className = "w-full max-w-4xl h-auto object-contain",
}: BannerAdSlotProps) {
  let sponsors: any[] = [];
  try {
    sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { priority: "desc" },
      include: { bannerImage: true },
    });
  } catch (err) {
    console.error("Error fetching sponsors for BannerAdSlot:", err);
  }

  const sponsor = sponsors[index];

  if (!sponsor && !fallbackImage) {
    return null;
  }

  const imageUrl = sponsor?.bannerImage?.url || fallbackImage;
  const link = sponsor?.link || fallbackLink;
  const title = sponsor?.title || "Advertisement";

  if (!imageUrl) return null;

  return (
    <div className="w-full flex justify-center py-4 md:py-6">
      <div className="block" title={title}>
        <img src={imageUrl} alt={title} className={className} loading="lazy" />
      </div>
    </div>
  );
}
