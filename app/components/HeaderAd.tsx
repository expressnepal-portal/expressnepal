"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeaderWithAds() {
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
      } catch (err) {
        console.error("Error loading header ads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading || ads.length === 0) return null;

  const ad = ads[0];
  const imageUrl = ad.bannerImage?.url || ad.adImage || "";

  if (!imageUrl) return null;

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
            src={imageUrl}
            alt={ad.title || "Header Ad"}
            className="w-full max-h-[100px] object-contain"
          />
        </div>
      </Link>
    </div>
  );
}
