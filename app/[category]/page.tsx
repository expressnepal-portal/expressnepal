export const runtime = "nodejs";
export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import { transliterateSlug } from "@/lib/transliterate";
import { getCleanContent, getCleanTitle, getPostUrl, extractImagesFromContent } from "../page";
import Card from "../components/Card";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category).toLowerCase().trim();

  // 1. Try exact slug match from DB
  let matchedCategory = await prisma.category.findUnique({
    where: { slug: decodedCategory },
  });

  // 2. Fallback: transliterate and search all categories
  if (!matchedCategory) {
    const allCategories = await prisma.category.findMany();
    matchedCategory =
      allCategories.find((c) => {
        const slugLower = c.slug.toLowerCase();
        const nameLower = c.name.toLowerCase();
        const transliteratedName = transliterateSlug(c.name).toLowerCase();
        const transliteratedNepali = c.nepaliName
          ? transliterateSlug(c.nepaliName).toLowerCase()
          : "";
        return (
          slugLower === decodedCategory ||
          nameLower === decodedCategory ||
          transliteratedName === decodedCategory ||
          transliteratedNepali === decodedCategory
        );
      }) || null;
  }

  const categoryDisplayName =
    matchedCategory?.nepaliName || matchedCategory?.name || decodeURIComponent(category);

  // 3. Fetch published posts in this category from local DB
  let posts: any[] = [];
  if (matchedCategory) {
    const dbPosts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        categories: {
          some: { categoryId: matchedCategory.id },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: {
        featuredImage: true,
        author: { select: { name: true, image: true } },
        categories: { include: { category: true } },
      },
    });

    posts = dbPosts.map((p) => {
      const primaryCat = p.categories[0]?.category;
      return {
        id: p.id,
        databaseId: undefined,
        uri: null,
        title: p.title,
        slug: p.slug,
        status: p.status,
        link: "",
        date: (p.publishedAt || p.createdAt).toISOString(),
        content: p.content,
        excerpt: p.excerpt,
        featuredImage: p.featuredImage?.url || null,
        images: extractImagesFromContent(p.content),
        categorySlug: primaryCat?.slug || matchedCategory!.slug,
        categoryName: primaryCat?.nepaliName || primaryCat?.name || categoryDisplayName,
        author: p.authorName
          ? { node: { name: p.authorName } }
          : p.author
          ? { node: { name: p.author.name } }
          : { node: { name: "expressNepal" } },
      };
    });
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <main className="w-full" style={{ paddingTop: "var(--header-height)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-mobile-safe pt-6 pb-16">

          {/* Section title */}
          <div className="flex justify-center mb-8 border-b-4 border-nepal-red pb-4 flex-col items-start">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-nepal-black font-nepali-serif">
              {categoryDisplayName}
            </h1>
          </div>

          {/* Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => {
                const contentImages = extractImagesFromContent(post.content);
                const featuredImageUrl = post.featuredImage;
                const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

                return (
                  <Card
                    key={post.id}
                    link={getPostUrl(post)}
                    images={thumbnailImage ? [thumbnailImage] : []}
                    title={getCleanTitle(post.title)}
                    content={getCleanContent(post.content, 150)}
                  />
                );
              })
            ) : (
              <div className="col-span-full w-full text-center text-gray-500 font-poppins py-20">
                No Content Available For Now
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
