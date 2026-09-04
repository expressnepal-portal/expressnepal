import React from "react";import HeaderClient from "./HeaderClient";
import { fetchNavbarMenu } from "@/lib/wordpress";
import { Category } from "@/lib/type";

const categorySlugMap: Record<string, string> = {
  "समाचार": "news",
  "news": "news",
  "राजनीति": "politics",
  "politics": "politics",
  "विचार": "opinion",
  "opinion": "opinion",
  "अर्थ": "economy",
  "अर्थतन्त्र": "economy",
  "economy": "economy",
  "business": "economy",
  "खेलकुद": "sports",
  "sports": "sports",
  "स्वास्थ्य/जीवन शैली": "health-and-lifestyle",
  "स्वास्थ्य-जीवन-शैली": "health-and-lifestyle",
  "health-and-lifestyle": "health-and-lifestyle",
  "society": "health-and-lifestyle",
  "विज्ञान प्रविधि": "technology",
  "technology": "technology",
  "science-and-technology": "technology",
  "अन्तराष्ट्रिय": "world",
  "world": "world",
  "international": "world",
  "कानून": "legal",
  "legal": "legal",
  "मल्टिमिडिया": "multimedia",
  "multimedia": "multimedia",
};

export default async function Header() {
  const navbarPages = await fetchNavbarMenu();

  const categories: Category[] = [
    { nepali: "होमपेज", english: "Homepage", slug: "/" },
    ...navbarPages.map((page) => {
      const normalizedTitle = page.title.trim();
      const normalizedSlug = page.slug.trim();
      const mappedSlug =
        categorySlugMap[normalizedSlug] ||
        categorySlugMap[normalizedTitle] ||
        page.slug;

      return {
        nepali: page.title,
        english: page.title,
        slug: mappedSlug,
      };
    }),
  ];

  return <HeaderClient categories={categories} />;
}
