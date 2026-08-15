"use client";

import { useEffect, useState } from "react";
import { fetchAdsBanner } from "@/lib/wordpress";
import { BannerAd } from "@/lib/type";
import Link from "next/link";

export default function HeaderWithAds() {
  const [ads, setAds] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      const data = await fetchAdsBanner();
      setAds(data);
      setLoading(false);
    };

    fetchAds();
  }, []);

  if (loading || ads.length === 0) return null;

  const ad = ads[0];

  return (
    <div className="w-full bg-gray-100 py-2 ">
      <Link
        href={ad.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-7xl mx-auto px-4"
      >
        <div className="w-full overflow-hidden rounded-lg">
          <img
            src={ad.adImage || ""}
            alt={ad.adTitle || ad.title}
            className="w-full max-h-[100px] object-contain"
          />
        </div>
      </Link>
    </div>
  );
}
