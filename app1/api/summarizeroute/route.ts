import { NextResponse } from "next/server";

/**
 * POST /api/summarizeroute
 * Body: { text: string }
 * Returns: { summary: string }
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No text provided for summarization" },
        { status: 400 }
      );
    }

    // Clean HTML and normalize whitespace
    const cleanText = text
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // TEMP summary logic — replace with AI model later
    const summary =
      cleanText.length > 500
        ? cleanText.slice(0, 500) + "..."
        : cleanText;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
