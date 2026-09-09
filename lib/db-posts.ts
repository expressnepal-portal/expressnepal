import { prisma } from "./prisma";
import { HomePagePosts } from "./type";
import * as cheerio from "cheerio";

export function extractImagesFromContent(content: string | null): string[] {
  if (!content) return [];
  const $ = cheerio.load(content);
  const images: string[] = [];

  $("img").each((_, img) => {
    let src =
      $(img).attr("data-src") ||
      $(img).attr("data-lazy-src") ||
      $(img).attr("src");

    if (!src) return;

    if (src.startsWith("data:image")) {
      src = $(img).attr("data-src") || $(img).attr("data-lazy-src") || "";
    }

    if (!src) return;
    if (src.startsWith("//")) src = `https:${src}`;
    images.push(src);
  });

  return [...new Set(images)];
}

export function formatDbPost(dbPost: any): any {
  if (!dbPost) return null;

  const primaryCategory = dbPost.categories?.[0]?.category;
  const categorySlug =
    primaryCategory?.slug === "business"
      ? "economy"
      : primaryCategory?.slug === "science-and-technology"
      ? "technology"
      : primaryCategory?.slug;

  return {
    id: dbPost.id,
    databaseId: undefined,
    uri: `/news/${dbPost.slug}`,
    title: dbPost.title,
    slug: dbPost.slug,
    status: dbPost.status,
    link: `/news/${dbPost.slug}`,
    date: dbPost.publishedAt
      ? new Date(dbPost.publishedAt).toISOString()
      : new Date(dbPost.createdAt).toISOString(),
    content: dbPost.content,
    excerpt: dbPost.excerpt,
    featuredImage: dbPost.featuredImage?.url || null,
    images: extractImagesFromContent(dbPost.content),
    categorySlug: categorySlug || "news",
    categoryName: primaryCategory?.nepaliName || primaryCategory?.name || "विशेष",
    author: {
      node: {
        name: dbPost.authorName || dbPost.author?.name || "Express Nepal",
      },
    },
    isBreaking: Boolean(dbPost.isBreaking),
    isFeatured: Boolean(dbPost.isFeatured),
  };
}

export async function getHomepagePostsFromDb(): Promise<HomePagePosts> {
  const emptyResult: HomePagePosts = {
    featured: [],
    trending: [],
    latest: [],
    politics: [],
    society: [],
    breaking: [],
    world: [],
    sports: [],
    podcast: [],
    technology: [],
    arts: [],
    economy: [],
    multimedia: [],
    international: [],
    opinion: [],
    legal: [],
    health: [],
    exclusive: [],
  };

  try {
    const allPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 100,
      include: {
        featuredImage: true,
        author: { select: { name: true, image: true } },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (allPosts.length === 0) return emptyResult;

    const formatted = allPosts.map(formatDbPost);

    const getCategoryPosts = (slugs: string[], limit = 6) => {
      const matching = formatted.filter((p) => {
        const postCatSlugs = allPosts
          .find((ap) => ap.id === p.id)
          ?.categories.map((c) => c.category.slug.toLowerCase()) || [];
        return slugs.some((s) => postCatSlugs.includes(s.toLowerCase()));
      });
      return matching.slice(0, limit);
    };

    const breakingPosts = formatted.filter((p) => p.isBreaking);
    const featuredPosts = formatted.filter((p) => p.isFeatured);

    const politics = getCategoryPosts(["politics", "rajniti"], 8);
    const economy = getCategoryPosts(["economy", "business", "artha"], 10);
    const society = getCategoryPosts(["society", "samaj"], 6);
    const sports = getCategoryPosts(["sports", "khelkud"], 6);
    const world = getCategoryPosts(["world", "international", "bidesh"], 6);
    const technology = getCategoryPosts(["technology", "science-technology", "science-and-technology"], 6);
    const arts = getCategoryPosts(["arts", "kala-sahitya", "literature"], 6);
    const opinion = getCategoryPosts(["opinion", "bichar"], 6);
    const legal = getCategoryPosts(["legal", "kanoon"], 6);
    const health = getCategoryPosts(["health", "health-and-lifestyle", "swasthya"], 6);
    const exclusive = getCategoryPosts(["exclusive", "vishesh"], 6);
    const podcast = getCategoryPosts(["podcast"], 6);
    const multimedia = getCategoryPosts(["multimedia"], 6);
    const news = getCategoryPosts(["news", "latest-news", "samachar"], 12);

    const fallbackLatest = news.length > 0 ? news : formatted.slice(0, 12);

    return {
      featured: featuredPosts,
      trending: formatted.slice(0, 6),
      latest: fallbackLatest,
      breaking: breakingPosts,
      politics,
      economy,
      society,
      sports,
      world,
      technology,
      arts,
      opinion,
      legal,
      health,
      exclusive,
      podcast,
      multimedia,
      international: world,
    };
  } catch (err) {
    console.error("Error fetching homepage posts from database:", err);
    return emptyResult;
  }
}

export async function getPostsFromDb(take = 20, skip = 0) {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take,
      skip,
      include: {
        featuredImage: true,
        author: { select: { name: true, image: true } },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return posts.map(formatDbPost);
  } catch (err) {
    console.error("Error fetching posts from database:", err);
    return [];
  }
}

export async function getPostsByCategoryFromDb(categorySlug: string, take = 10) {
  try {
    const slug = categorySlug.toLowerCase().trim();
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        categories: {
          some: {
            category: {
              OR: [
                { slug: slug },
                { slug: slug === "economy" ? "business" : slug },
                { slug: slug === "technology" ? "science-technology" : slug },
                { slug: slug === "health-and-lifestyle" ? "health" : slug },
              ],
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take,
      include: {
        featuredImage: true,
        author: { select: { name: true, image: true } },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return posts.map(formatDbPost);
  } catch (err) {
    console.error(`Error fetching posts for category ${categorySlug}:`, err);
    return [];
  }
}

export async function searchPostsFromDb(query: string, take = 30) {
  if (!query || query.trim().length === 0) return [];

  const trimmed = query.trim();
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: trimmed, mode: "insensitive" } },
          { excerpt: { contains: trimmed, mode: "insensitive" } },
          { content: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take,
      include: {
        featuredImage: true,
        author: { select: { name: true, image: true } },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return posts.map(formatDbPost);
  } catch (err) {
    console.error("Error searching posts in database:", err);
    return [];
  }
}
