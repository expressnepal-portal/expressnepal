"use client";
import { BannerAd } from "@/lib/type";
import { fetchAdsBanner } from "@/lib/wordpress";
import React, { useEffect, useState } from "react";

interface BannerAdsProps {
  category?: string; // optional filter by category
}

const BannerAds: React.FC = () => {
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      const data = await fetchAdsBanner();
      console.log("This is ad banner ",data)

      // Only keep active banners
      const activeBanners = data.filter((banner) => banner.active);

      setBanners(activeBanners);
      setLoading(false);
    };

    loadBanners();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  if (banners.length === 0) {
    return <div className="text-center py-8">No banners available</div>;
  }

  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-4">
      {banners.map((banner) => (
        <a
          key={banner.id}
          href={banner.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full md:w-1/2 lg:w-1/3 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          {banner.adImage ? (
            <img
              src={banner.adImage}
              alt={banner.adTitle || banner.title}
              className="w-full h-48 md:h-56 object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center">
              {banner.title}
            </div>
          )}
        </a>
      ))}
    </div>
  );
};

export default BannerAds;
