"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  FileText,
  Zap,
  CheckCircle2,
  Copy,
  ArrowRight,
  Loader2,
  ExternalLink,
  Key,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Image as ImageIcon,
  Search,
  Check,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { type AIProcessedNewsResult, buildNewsSummaryBoxHtml } from "@/lib/ai-agent";

interface AiNewsAgentProps {
  categories: { id: string; name: string; nepaliName?: string | null }[];
}

export default function AiNewsAgent({ categories }: AiNewsAgentProps) {
  const router = useRouter();

  // Input states
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [tone, setTone] = useState<"standard" | "analytical" | "breaking" | "simple">("standard");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);

  // Status states
  const [scraping, setScraping] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<AIProcessedNewsResult | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [editableContent, setEditableContent] = useState<string>("");
  const [editableHighlights, setEditableHighlights] = useState<string[]>([]);
  const [includeSummaryBox, setIncludeSummaryBox] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isBreakingToggle, setIsBreakingToggle] = useState<boolean>(false);

  // Quick preset links & sources
  const sampleNepaliSources = [
    { name: "अनलाइनखबर", url: "https://www.onlinekhabar.com" },
    { name: "रातोपाटी", url: "https://ratopati.com" },
    { name: "सेतोपाटी", url: "https://setopati.com" },
    { name: "कान्तिपुर", url: "https://ekantipur.com" },
    { name: "नागरिक", url: "https://nagariknews.nagariknetwork.com" },
    { name: "TechPana (नेपाली प्रविधि)", url: "https://www.techpana.com" },
  ];

  const sampleForeignSources = [
    { name: "BBC News", url: "https://www.bbc.com/news" },
    { name: "Reuters", url: "https://www.reuters.com" },
    { name: "TechCrunch", url: "https://techcrunch.com" },
  ];

  // Scrape URL handler
  const handleScrapeUrl = async () => {
    if (!sourceUrl.trim()) {
      setError("कृपया समाचार लिङ्क (URL) राख्नुहोस्।");
      return;
    }

    setScraping(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "समाचार सामग्री तान्न सकिएन।");
      }

      setSourceTitle(data.title || "");
      setRawText(data.text || "");
      setInputMode("text"); // Switch to preview scraped text
    } catch (err: any) {
      setError(err.message || "Failed to fetch source news");
    } finally {
      setScraping(false);
    }
  };

  // Process with AI handler
  const handleProcessNews = async () => {
    if (!rawText.trim()) {
      setError("कृपया प्रोसेस गर्नका लागि समाचार सामग्री राख्नुहोस् वा URL बाट तान्नुहोस्।");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/process-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          sourceTitle,
          sourceUrl: inputMode === "url" ? sourceUrl : undefined,
          tone,
          apiKey: customApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI प्रशोधनमा समस्या आयो।");
      }

      const aiData: AIProcessedNewsResult = data.data;
      setResult(aiData);
      setSelectedTitle(aiData.title);
      setEditableContent(aiData.content);
      setEditableHighlights(aiData.highlights || []);
      setIsBreakingToggle(aiData.isBreaking);

      // Match category
      if (aiData.suggestedCategory) {
        const found = categories.find(
          (c) =>
            (c.nepaliName && c.nepaliName.includes(aiData.suggestedCategory)) ||
            c.name.toLowerCase().includes(aiData.suggestedCategory.toLowerCase())
        );
        if (found) {
          setSelectedCategoryId(found.id);
        } else if (categories.length > 0) {
          setSelectedCategoryId(categories[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || "AI Error");
    } finally {
      setProcessing(false);
    }
  };

  // Transfer to Post Editor handler
  const handleTransferToEditor = () => {
    if (!result) return;

    // If summary box toggle is checked, prepend the summary HTML box to the article body
    let finalContent = editableContent;
    if (includeSummaryBox && editableHighlights.length > 0) {
      const summaryBoxHtml = buildNewsSummaryBoxHtml(editableHighlights);
      // Only prepend if not already in content
      if (!finalContent.includes("express-news-summary")) {
        finalContent = `${summaryBoxHtml}\n\n${finalContent}`;
      }
    }

    const draftData = {
      title: selectedTitle,
      content: finalContent,
      excerpt: result.excerpt,
      slug: result.suggestedSlug,
      isBreaking: isBreakingToggle,
      categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
      metaTitle: result.metaTitle,
      metaDescription: result.metaDescription,
      highlights: editableHighlights,
    };

    try {
      sessionStorage.setItem("ai_draft_post", JSON.stringify(draftData));
      router.push("/admin/posts/new?from_ai=1");
    } catch (e) {
      console.error(e);
      router.push("/admin/posts/new");
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-900 via-rose-950 to-neutral-900 p-6 md:p-8 rounded-2xl text-white shadow-md">
        <div className="space-y-2">

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            अन्तर्राष्ट्रिय तथा अन्य समाचार प्रशोधन स्टुडियो
          </h1>
          <p className="text-sm text-red-100/80 max-w-2xl leading-relaxed">
            विदेशी प्रविधि तथा अन्य समाचारलाई मौलिक नेपाली भाषामा पुनर्लेखन गर्नुहोस्, आकर्षक शीर्षकहरू छान्नुहोस्, मुख्य बुँदाहरू र एसईओ तयार गर्नुहोस्।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApiInput(!showApiInput)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-300" />
            <span>{customApiKey ? "API Key Set ✓" : "Gemini API Key"}</span>
          </button>
        </div>
      </div>

      {/* Optional Custom API Key panel */}
      {showApiInput && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              Custom Google Gemini API Key (वैकल्पिक):
            </span>
            <span className="text-[11px] text-amber-700">
              (यदि सर्भर .env मा GEMINI_API_KEY छैन भने यहाँ राख्न सक्नुहुन्छ)
            </span>
          </div>
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-mono text-xs focus:outline-none focus:border-amber-600"
          />
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <strong className="font-semibold block">त्रुटि (Error)</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left is Source Ingestion, Right is AI Result Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Input */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                १. स्रोत सामग्री (Source Input)
              </span>
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setInputMode("url")}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    inputMode === "url"
                      ? "bg-white text-gray-900 shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  URL Link
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    inputMode === "text"
                      ? "bg-white text-gray-900 shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
              </div>
            </div>

            {/* URL Input */}
            {inputMode === "url" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    समाचार वा युट्युब लिङ्क (Article / YouTube Video URL):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://www.onlinekhabar.com/... वा YouTube URL"
                      className="flex-1 px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleScrapeUrl}
                      disabled={scraping || !sourceUrl.trim()}
                      className="admin-btn-primary px-4 py-2.5 text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {scraping ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          तान्दैछ...
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          सामग्री तान्नुहोस्
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preset Sources */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2.5">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-600 block mb-1.5">
                      नेपाली समाचार पोर्टलहरू (Nepali Portals):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleNepaliSources.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setSourceUrl(s.url);
                          }}
                          className="text-[11px] bg-white border border-gray-200 hover:border-nepal-red hover:text-nepal-red text-gray-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-gray-200/60">
                    <span className="text-[10px] font-medium text-gray-500 block mb-1">
                      अन्तर्राष्ट्रिय / विदेशी स्रोत (Foreign Sources):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleForeignSources.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setSourceUrl(s.url);
                          }}
                          className="text-[10px] bg-white/80 border border-gray-200 hover:border-gray-400 text-gray-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Text & Content Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  मूल शीर्षक / Source Headline (वैकल्पिक):
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="Original English / Source Title"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600">
                    मूल समाचार सामग्री / Copied News Body:
                  </label>
                  {rawText && (
                    <span className="text-[10px] text-gray-400">
                      {rawText.length} characters
                    </span>
                  )}
                </div>
                <textarea
                  rows={9}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="अंग्रेजी वा अन्य स्रोतबाट प्रतिलिपि गरिएको समाचार यहाँ टाँस्नुहोस् (Paste original English or source news text here)..."
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white resize-y font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Tone Selector */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  पुनर्लेखन शैली (Tone):
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                >
                  <option value="standard">मानक पत्रकारिता (Standard News)</option>
                  <option value="analytical">गहन विश्लेषणात्मक (Analytical)</option>
                  <option value="breaking">ताजा / ब्रेकिङ अपडेट (Breaking)</option>
                  <option value="simple">सरल र स्पष्ट नेपाली (Simple)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  श्रेणी (Category Target):
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                >
                  <option value="">Auto-Detect Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nepaliName || c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Process Action Button */}
            <button
              type="button"
              onClick={handleProcessNews}
              disabled={processing || !rawText.trim()}
              className="w-full admin-btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-50 text-sm shadow-sm cursor-pointer mt-3"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  एआईद्वारा समाचार पुनर्लेखन हुँदैछ...
                </>
              ) : (
                <>
                  एआईद्वारा समाचार प्रशोधन गर्नुहोस्
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Processed Results */}
        <div className="lg:col-span-7 space-y-5">
          {!result && !processing && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-nepal-red flex items-center justify-center mx-auto">
              </div>
              <h3 className="text-base font-semibold text-gray-800">
                समाचार प्रशोधन परिणाम यहाँ देखिनेछ
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                बायाँ तर्फ समाचारको लिङ्क वा सामग्री राखेर &quot;एआईद्वारा समाचार प्रशोधन गर्नुहोस्&quot; मा क्लिक गर्नुहोस्। एआईले पूर्ण नेपाली ड्राफ्ट तयार गर्नेछ।
              </p>
            </div>
          )}

          {processing && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <Loader2 className="w-10 h-10 animate-spin text-nepal-red mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-900">
                  समाचार प्रशोधन हुँदैछ...
                </h3>
                <p className="text-xs text-gray-500">
                  अंग्रेजीबाट मौलिक नेपाली अनुवाद, आकर्षक शीर्षकहरू, मुख्य बुँदाहरू र एसईओ मेटा तयार गरिँदैछ।
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    प्रशोधन सम्पन्न (Ready)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTransferToEditor}
                    className="admin-btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>सम्पादक (Editor) मा पठाउनुहोस्</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1. Attractive Headlines Picker */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-nepal-red" />
                    आकर्षक नेपाली शीर्षकहरू (Headline Options):
                  </label>
                  <span className="text-[11px] text-gray-400">
                    एउटा शीर्षकमा क्लिक गरी चयन गर्नुहोस्
                  </span>
                </div>

                <div className="space-y-2">
                  {result.attractiveHeadlines.map((h, i) => {
                    const isSelected = selectedTitle === h;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedTitle(h)}
                        className={`p-3 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-red-50 border-red-300 text-gray-950 font-semibold shadow-xs"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                        style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            isSelected
                              ? "bg-nepal-red text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className="flex-1 leading-snug">{h}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Editable selected title */}
                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                    चयन गरिएको मुख्य शीर्षक (सम्पादन गर्न मिल्ने):
                  </label>
                  <input
                    type="text"
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white text-gray-900"
                    style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
                  />
                </div>
              </div>

              {/* 2. Breaking News Potential */}
              <div
                className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                  result.breakingScore >= 60
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50/60 border-amber-200/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      result.breakingScore >= 60
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        ताजा / ब्रेकिङ मूल्याङ्कन: {result.breakingScore}/१००
                      </span>
                      {result.breakingScore >= 60 ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Breaking Potential
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Regular News
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {result.breakingReason}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isBreakingToggle}
                    onChange={(e) => setIsBreakingToggle(e.target.checked)}
                    className="rounded text-nepal-red focus:ring-nepal-red"
                  />
                  <span>Breaking Flag लगाउनुहोस्</span>
                </label>
              </div>

              {/* 3. News Summary Box (समाचार सारांश - OK AI Style) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">

                    समाचार सारांश (News Summary Card):
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSummaryBox}
                        onChange={(e) => setIncludeSummaryBox(e.target.checked)}
                        className="rounded text-nepal-red focus:ring-nepal-red cursor-pointer"
                      />
                      <span>पोष्टको सुरुमा यो बक्स जोड्नुहोस्</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          buildNewsSummaryBoxHtml(editableHighlights),
                          "summary_box"
                        )
                      }
                      className="text-xs text-gray-500 hover:text-nepal-red flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "summary_box" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Summary HTML</span>
                    </button>
                  </div>
                </div>

                {/* Styled Live News Summary Card */}
                <div className="express-news-summary bg-slate-50/90 border border-slate-200 rounded-2xl p-5 shadow-xs not-prose">
                  <div className="summary-header flex flex-wrap items-baseline gap-2 pb-3 mb-3 border-b border-slate-200 relative">
                    <div className="summary-title-wrap flex items-center gap-2">
                      <h4 className="summary-title font-bold text-gray-900 text-base font-nepali-serif m-0">
                        News Summary
                      </h4>
                    </div>
                    <span className="summary-badge text-xs text-gray-500 font-normal ml-auto sm:ml-2">
                      Editorially reviewed.
                    </span>
                  </div>

                  {/* Bullet inputs */}
                  <div className="space-y-2.5">
                    {editableHighlights.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="w-2 h-2 rounded-full bg-nepal-red mt-2 shrink-0"></span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...editableHighlights];
                            newPoints[idx] = e.target.value;
                            setEditableHighlights(newPoints);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red bg-white"
                          style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditableHighlights(
                              editableHighlights.filter((_, i) => i !== idx)
                            );
                          }}
                          title="बुँदा हटाउनुहोस्"
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setEditableHighlights([
                          ...editableHighlights,
                          "नयाँ सम्पादित मुख्य बुँदा...",
                        ])
                      }
                      className="mt-2 text-xs font-semibold text-nepal-red hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>थप बुँदा थप्नुहोस् (Add Bullet)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Rewritten Nepali News Article */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    मौलिक नेपाली समाचार विवरण (Original Rewritten Copy):
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editableContent, "content")}
                    className="text-xs text-gray-500 hover:text-nepal-red flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "content" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy HTML</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white font-sans leading-relaxed text-gray-800"
                  style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
                />
              </div>

              {/* 5. SEO & Slug Metadata */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  एसईओ तथा मेटा विवरण (SEO & Slug):
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-gray-600 block mb-1">
                      एसईओ शीर्षक (Meta Title):
                    </span>
                    <input
                      type="text"
                      defaultValue={result.metaTitle}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <span className="font-semibold text-gray-600 block mb-1">
                      Romanized URL Slug:
                    </span>
                    <input
                      type="text"
                      defaultValue={result.suggestedSlug}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-gray-600 block mb-1 text-xs">
                    मेटा विवरण (Meta Description):
                  </span>
                  <textarea
                    rows={2}
                    defaultValue={result.metaDescription}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white resize-none"
                  />
                </div>
              </div>

              {/* 6. Image Recommendation info (since user uploads images manually) */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
                <ImageIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block">
                    तस्बिर सिफारिस (Featured Image Suggestion):
                  </strong>
                  <p className="text-blue-800 leading-relaxed">
                    {result.imageSuggestions.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-blue-600 font-semibold">
                      खोज्न मिल्ने शब्दहरू (Search Keywords):
                    </span>
                    {result.imageSuggestions.searchKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="bg-white border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleTransferToEditor}
                  className="w-full md:w-auto admin-btn-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>सम्पादक (Post Editor) मा पठाउनुहोस् र तस्बिर राख्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
