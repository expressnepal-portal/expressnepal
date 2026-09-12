import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "https://www.expressnepal.com";
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const currentDate = new Date();

  // 1. Static high-priority pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 2. Fetch all dynamic categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/${encodeURIComponent(cat.slug)}`,
      lastModified: cat.updatedAt || currentDate,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Error generating category sitemap:", e);
  }

  // 3. Fetch all published news / posts (up to 5,000 for fast indexing)
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 5000,
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        categories: {
          take: 1,
          include: {
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    postPages = posts.map((post) => {
      const primaryCategory = post.categories?.[0]?.category?.slug;
      const postPath = primaryCategory
        ? `/${encodeURIComponent(primaryCategory)}/${encodeURIComponent(post.slug)}`
        : `/news/${encodeURIComponent(post.slug)}`;

      return {
        url: `${baseUrl}${postPath}`,
        lastModified: post.updatedAt || post.publishedAt || currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      };
    });
  } catch (e) {
    console.error("Error generating post sitemap:", e);
  }

  return [...staticPages, ...categoryPages, ...postPages];
}
