"use client";
import React, { useEffect, useState } from "react";

interface BannerAdsProps {
  category?: string; // optional filter by category
}

const BannerAds: React.FC<BannerAdsProps> = ({ category }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      try {
        const query = category ? `?categorySlug=${encodeURIComponent(category)}` : "";
        const res = await fetch(`/api/sponsors${query}`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data || []);
        }
      } catch (err) {
        console.error("Error loading banners:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, [category]);

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-4">
      {banners.map((banner) => {
        const imageUrl = banner.bannerImage?.url || banner.adImage;
        return (
          <a
            key={banner.id}
            href={banner.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full md:w-1/2 lg:w-1/3 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={banner.title || "Sponsor"}
                className="w-full h-48 md:h-56 object-cover"
              />
            ) : (
              <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center">
                {banner.title}
              </div>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default BannerAds;
