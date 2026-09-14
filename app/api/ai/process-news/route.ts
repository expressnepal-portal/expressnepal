import { NextResponse } from "next/server";
import { processNewsWithAI } from "@/lib/ai-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, sourceTitle, sourceUrl, tone, targetLength, apiKey } = body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "कम्तीमा २० अक्षर भएको समाचार सामग्री आवश्यक छ।" },
        { status: 400 }
      );
    }

    const result = await processNewsWithAI({
      rawText,
      sourceTitle,
      sourceUrl,
      tone,
      targetLength,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("AI Process Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process news with AI" },
      { status: 500 }
    );
  }
}
