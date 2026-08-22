"use client";

import Image from "next/image";
import React from "react";

type ImageSliderProps = {
  images?: string[];
  title: string;
  className?: string;
  fallbackGradient?: string;
};

function isSafeDomain(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith("nepalvoices.com");
  } catch {
    return false;
  }
}

export default function ImageSlider({
  images = [],
  title,
  className = "",
  fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300",
}: ImageSliderProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {images.length === 0 ? (
        <div className={`w-full h-48 md:h-56 lg:h-64 ${fallbackGradient}`} />
      ) : (
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {images.map((img, index) => {
            const safe = isSafeDomain(img);
            return (
              <div
                key={index}
                className="relative w-full h-full shrink-0 snap-center bg-gray-100"
              >
                {safe ? (
                  <Image
                    src={img}
                    alt={`${title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <img
                    src={img}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

