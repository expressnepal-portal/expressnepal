"use client";

import { useEffect, useState } from "react";

interface BannerAdsTopProps {
  maxHeight?: number; // optional, limit banner height
}

export default function BannerAdsTop({ maxHeight = 200 }: BannerAdsTopProps) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch("/api/sponsors");
        if (res.ok) {
          const data = await res.json();
          setAds(data || []);
        }
      } catch (error) {
        console.error("Error fetching top banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading || ads.length === 0) return null;

  const ad = ads[1] || ads[0];
  const imageUrl = ad.bannerImage?.url || ad.adImage || "";

  if (!imageUrl) return null;

  return (
    <div className="w-full bg-gray-100 flex items-center py-2 mt-44 -mb-40">
      <div className="block w-full max-w-7xl px-4">
        <div
          className="w-full overflow-hidden rounded-lg flex justify-center items-center"
          style={{ maxHeight }}
        >
          <img
            src={imageUrl}
            alt={ad.title || "Advertisement"}
            className="w-full h-[100px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
