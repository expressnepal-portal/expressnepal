import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    // If it's a YouTube URL, fetch title and metadata cleanly
    const isYouTube = targetUrl.hostname.includes("youtube.com") || targetUrl.hostname.includes("youtu.be");
    if (isYouTube) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl.toString())}&format=json`
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          return NextResponse.json({
            success: true,
            title: oembedData.title || "YouTube News / Report",
            description: `Author: ${oembedData.author_name || "YouTube"}`,
            ogImage: oembedData.thumbnail_url || "",
            sourceUrl: targetUrl.toString(),
            text: `[युट्युब भिडियो रिपोर्ट]: ${oembedData.title}\nच्यानल: ${oembedData.author_name}\n\n(कृपया भिडियोको मुख्य विवरण, अन्तर्वार्ता वा ट्रान्सक्रिप्ट तल थप विवरणका रूपमा राख्न सक्नुहुन्छ)`,
          });
        }
      } catch (e) {
        // Fallback to normal scraping
      }
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, header, noscript, iframe, .ad, .ads, .sidebar, .banner, .social-share, .comments, .related-news, .footer, .header").remove();

    // Extract title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim();

    // Extract description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // Extract main image
    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";

    // Extract article text paragraphs - including common Nepali news portal classes
    let articleText = "";
    const articleElements = $(
      "article, .article-body, .entry-content, .post-content, .story-body, .news-content, .detail-box, .content-news, .post-details, .story-element-text, .full-content, .news-details, .news-text, main"
    );

    if (articleElements.length > 0) {
      const paragraphs: string[] = [];
      articleElements.find("p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 25) {
          paragraphs.push(text);
        }
      });
      articleText = paragraphs.join("\n\n");
    }

    // Fallback if specific selectors didn't catch enough text
    if (!articleText || articleText.length < 80) {
      const allParagraphs: string[] = [];
      $("p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 25) {
          allParagraphs.push(text);
        }
      });
      articleText = allParagraphs.join("\n\n");
    }

    return NextResponse.json({
      success: true,
      title,
      description,
      ogImage,
      sourceUrl: targetUrl.toString(),
      text: articleText,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape article" },
      { status: 500 }
    );
  }
}
