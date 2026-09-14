"use client";

import React, { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { createPost, updatePost, type ActionState } from "./action";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "../components/ImageUpload";
import { transliterateSlug } from "@/lib/transliterate";
import { User as UserIcon, Hash, Zap, Star, Globe, CheckCircle2, Newspaper } from "lucide-react";

interface AuthorUser {
  id: string;
  name: string;
  email: string;
}

interface PostFormProps {
  categories?: { id: string; name: string; nepaliName?: string | null }[];
  users?: AuthorUser[];
  currentUserId?: string;
  post?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    highlight?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    status: string;
    authorId?: string | null;
    authorName?: string | null;
    author?: { id: string; name: string } | null;
    categoryIds?: string[];
    featuredImageId: string | null;
    featuredImage?: {
      id: string;
      url: string;
      alt?: string | null;
    } | null;
    isBreaking?: boolean;
    isFeatured?: boolean;
  };
}

export function PostForm({
  categories = [],
  users = [],
  currentUserId,
  post,
}: PostFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [highlight, setHighlight] = useState(post?.highlight || "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");

  const [authorMode, setAuthorMode] = useState<"user" | "custom">(
    post?.authorName ? "custom" : "user"
  );
  const [authorName, setAuthorName] = useState(post?.authorName || "");
  const [selectedAuthorId, setSelectedAuthorId] = useState(
    post?.authorId || (post?.authorName ? "" : currentUserId || "")
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    post?.categoryIds || []
  );
  const [featuredImageId, setFeaturedImageId] = useState<string>(
    post?.featuredImageId || ""
  );
  const [isBreaking, setIsBreaking] = useState(post?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false);
  const [importedFromAi, setImportedFromAi] = useState(false);

  // Check if loaded from AI Studio
  useEffect(() => {
    if (typeof window !== "undefined" && !post) {
      try {
        const aiDraft = sessionStorage.getItem("ai_draft_post");
        if (aiDraft) {
          const parsed = JSON.parse(aiDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.content) setContent(parsed.content);
          if (parsed.excerpt) setExcerpt(parsed.excerpt);
          if (parsed.slug) setSlug(parsed.slug);
          if (parsed.isBreaking !== undefined) setIsBreaking(Boolean(parsed.isBreaking));
          if (parsed.categoryIds && Array.isArray(parsed.categoryIds)) {
            setSelectedCategoryIds(parsed.categoryIds);
          }
          if (parsed.metaTitle) setMetaTitle(parsed.metaTitle);
          if (parsed.metaDescription) setMetaDescription(parsed.metaDescription);
          if (parsed.highlights && Array.isArray(parsed.highlights)) {
            setHighlight(parsed.highlights.map((h: string) => `• ${h}`).join("\n"));
          }

          setImportedFromAi(true);
          sessionStorage.removeItem("ai_draft_post");
        }
      } catch (err) {
        console.error("Failed to load AI draft:", err);
      }
    }
  }, [post]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleGenerateSlug = () => {
    if (!title.trim()) return;
    const generated = transliterateSlug(title);
    setSlug(generated);
  };

  const action = post
    ? updatePost.bind(null, post.id)
    : createPost;

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* AI Draft Banner notification if populated */}
      {importedFromAi && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>AI News Studio बाट समाचार सफलतापूर्वक लोड भयो!</strong> शीर्षक, सामग्री, बुँदाहरू र एसईओ मेटा सेट गरिएको छ। तल तस्बिर राखेर प्रकाशित गर्नुहोस्।
            </span>
          </div>
          <button
            type="button"
            onClick={() => setImportedFromAi(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {state?.error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {state.error}
        </div>
      )}

      {/* Two-column layout: Editor left, Meta right */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Main content */}
        <div className="flex-1 space-y-5">
          {/* Top Quick News Studio Banner */}
          <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
              <Newspaper className="w-4 h-4 text-nepal-red" />
              <span>विदेशी वा अन्य समाचारलाई नेपालीमा पुनर्लेखन गर्न चाहनुहुन्छ?</span>
            </div>
            <Link
              href="/admin/ai-agent"
              className="text-xs bg-nepal-red hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
            >
              <span>News Studio खोल्नुहोस्</span>
            </Link>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Article Title (समाचार शीर्षक)
              </label>
            </div>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-lg font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white text-gray-900 transition-colors"
              placeholder="Enter article headline..."
              style={{ fontFamily: '"Noto Sans Devanagari", "Poppins", sans-serif' }}
            />
          </div>

          {/* Highlights (मुख्य बुँदाहरू) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Key Highlights / मुख्य बुँदाहरू (Bullet Points)
              </label>
              <span className="text-[11px] text-gray-400">वैकल्पिक / Optional</span>
            </div>
            <textarea
              name="highlight"
              rows={3}
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="• मुख्य बुँदा १&#10;• मुख्य बुँदा २&#10;• मुख्य बुँदा ३"
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-white text-gray-800 resize-y"
              style={{ fontFamily: '"Noto Sans Devanagari", "Poppins", sans-serif' }}
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Content (समाचार सामग्री)
            </label>
            <RichTextEditor
              key={content ? "editor-with-content" : "editor-empty"}
              initialContent={content}
              onChange={setContent}
            />
            {/* Hidden input to capture HTML for server action */}
            <input type="hidden" name="content" value={content} />
          </div>
        </div>

        {/* Right: Meta sidebar */}
        <div className="w-full xl:w-[320px] space-y-5 shrink-0">
          {/* Post ID & Info (if editing) */}
          {post?.id && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span>Post ID:</span>
                <span className="font-mono text-gray-900 font-semibold truncate max-w-[140px]" title={post.id}>
                  {post.id}
                </span>
              </div>
              <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                EDIT
              </span>
            </div>
          )}

          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue={post?.status || "DRAFT"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red bg-white text-sm font-medium"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* NEWS BADGES & PLACEMENT */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
              News Badges & Placement
            </label>
            <div className="space-y-3">
              {/* Breaking News Toggle */}
              <label
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isBreaking
                    ? "bg-red-50 border border-red-200"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  name="isBreaking"
                  value="true"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Zap className={`w-4 h-4 ${isBreaking ? "text-red-600" : "text-gray-400"}`} />
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${isBreaking ? "text-red-700" : "text-gray-700"}`}>
                    Breaking News
                  </span>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Shows in the Breaking News ticker bar & hero section
                  </p>
                </div>
              </label>

              {/* Featured News Toggle */}
              <label
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isFeatured
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  name="isFeatured"
                  value="true"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <Star className={`w-4 h-4 ${isFeatured ? "text-amber-600" : "text-gray-400"}`} />
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${isFeatured ? "text-amber-700" : "text-gray-700"}`}>
                    Featured / विशेष
                  </span>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Shows in the Featured / Exclusive hero section
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Author Space (Registered Member or Manual Custom Author) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Author / लेखक
              </label>
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    authorMode === "user"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => {
                    setAuthorMode("user");
                    setAuthorName("");
                  }}
                >
                  Team User
                </button>
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    authorMode === "custom"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => {
                    setAuthorMode("custom");
                    setSelectedAuthorId("");
                  }}
                >
                  Manual Name
                </button>
              </div>
            </div>

            {authorMode === "user" ? (
              <div>
                <select
                  name="authorId"
                  value={selectedAuthorId}
                  onChange={(e) => setSelectedAuthorId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red bg-white text-sm"
                >
                  <option value="">expressNepal (Default Editorial)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="authorName" value="" />
                <p className="text-[11px] text-gray-400 mt-1">
                  Leave on default for expressNepal branding.
                </p>
              </div>
            ) : (
              <div>
                <input
                  name="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. श्याम श्रेष्ठ / Reuters / Guest Columnist"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red text-sm"
                  style={{ fontFamily: '"Noto Sans Devanagari", "Poppins", sans-serif' }}
                />
                <input type="hidden" name="authorId" value="" />
                <p className="text-[11px] text-gray-400 mt-1">
                  Type any custom journalist, guest writer, or news agency name without creating a user account.
                </p>
              </div>
            )}
          </div>

          {/* Slug with Auto Romanize Button */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Slug / URL (Romanized)
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-xs text-nepal-red hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Convert Nepali title to Roman English URL"
              >
                <Sparkles className="w-3 h-3" />
                Auto Romanize
              </button>
            </div>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red text-sm font-mono text-gray-800"
              placeholder="e.g. asti-kushko-shav-banaera"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Auto converts Nepali text to Roman English URL slug.
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Excerpt / Summary
            </label>
            <textarea
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red text-sm resize-none"
              placeholder="Short summary..."
              style={{ fontFamily: '"Noto Sans Devanagari", "Poppins", sans-serif' }}
            />
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              SEO Meta Settings
            </label>
            <div>
              <span className="text-[11px] font-medium text-gray-500 block mb-1">
                SEO Meta Title:
              </span>
              <input
                name="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Google Search Title..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 block mb-1">
                SEO Meta Description:
              </span>
              <textarea
                name="metaDescription"
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Short meta description for search engines..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none"
              />
            </div>
          </div>

          {/* Categories (Single or Multiple) */}
          {categories.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Categories ({selectedCategoryIds.length} selected)
                </label>
                {selectedCategoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryIds([])}
                    className="text-[11px] text-gray-400 hover:text-nepal-red cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Selected Pills */}
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pb-2 border-b border-gray-100">
                  {selectedCategoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (!cat) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-red-50 text-nepal-red border border-red-200 text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {cat.nepaliName || cat.name}
                        <button
                          type="button"
                          onClick={() => toggleCategory(id)}
                          className="hover:text-red-800 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Category Checkbox List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-red-50/70 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="categoryIds"
                          value={cat.id}
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-gray-300 text-nepal-red focus:ring-nepal-red"
                        />
                        <span>{cat.nepaliName || cat.name}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        /{cat.name.toLowerCase()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Image (Manual Upload by User) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Featured Image / मुख्य तस्बिर
            </label>
            <ImageUpload
              currentUrl={post?.featuredImage?.url}
              onUpload={(media) => setFeaturedImageId(media.id)}
              label="तस्बिर यहाँ ड्रप वा अपलोड गर्नुहोस्"
            />
            <input
              type="hidden"
              name="featuredImageId"
              value={featuredImageId}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-nepal-red hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer text-sm shadow-sm"
          >
            {isPending
              ? "Saving..."
              : post
              ? "Update Article"
              : "Publish Article"}
          </button>
        </div>
      </div>
    </form>
  );
}
