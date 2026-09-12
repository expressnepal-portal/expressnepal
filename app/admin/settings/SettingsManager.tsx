"use client";

import React, { useState, useRef } from "react";

interface SettingsData {
  id: string;
  siteName: string;
  siteDescription: string;
  logoImageId: string | null;
  logoUrl: string | null;
  faviconImageId: string | null;
  faviconUrl: string | null;
}

export default function SettingsManager({ settings }: { settings: SettingsData }) {
  const [siteName, setSiteName] = useState(settings.siteName || "Express Nepal");
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription || "");
  
  // Logo state
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [logoImageId, setLogoImageId] = useState(settings.logoImageId || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Favicon state
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [faviconImageId, setFaviconImageId] = useState(settings.faviconImageId || "");
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", type === "logo" ? "Site Logo" : "Site Favicon");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (type === "logo") {
        setLogoUrl(data.url);
        setLogoImageId(data.id);
      } else {
        setFaviconUrl(data.url);
        setFaviconImageId(data.id);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: `Failed to upload ${type}` });
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("siteName", siteName);
      formData.append("siteDescription", siteDescription);
      if (logoImageId) {
        formData.append("logoImageId", logoImageId);
      }
      if (faviconImageId) {
        formData.append("faviconImageId", faviconImageId);
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setMessage({ type: "success", text: "Settings saved successfully! Changes are now live." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-semibold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">General Site Settings</h2>

        {/* Site Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site Name (Title)
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
            placeholder="e.g. Express Nepal"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            This name appears in search engines (Google), browser tabs, bookmarks, and OpenGraph social shares.
          </p>
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site Description (Meta & SEO)
          </label>
          <textarea
            rows={3}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
            placeholder="e.g. Nepal's leading news portal providing live breaking news, politics, and analysis."
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Used as the default meta description for SEO ranking and social media preview snippets.
          </p>
        </div>

        {/* Site Logo Upload */}
        <div className="border-t pt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Main Site Header Logo
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-48 h-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden p-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Site Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400 font-medium text-center">No custom logo (Default logo.png)</span>
              )}
            </div>
            <div>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => handleImageUpload(e, "logo")}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  {uploadingLogo ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl(null);
                      setLogoImageId("");
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended format: PNG or SVG with transparent background (approx 360x90px).
              </p>
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="border-t pt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Favicon / Browser Tab Icon
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden p-2">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt="Favicon Preview"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400 font-medium text-center">Default</span>
              )}
            </div>
            <div>
              <input
                ref={faviconFileInputRef}
                type="file"
                accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                onChange={(e) => handleImageUpload(e, "favicon")}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => faviconFileInputRef.current?.click()}
                  disabled={uploadingFavicon}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  {uploadingFavicon ? "Uploading..." : faviconUrl ? "Change Favicon" : "Upload Favicon"}
                </button>
                {faviconUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFaviconUrl(null);
                      setFaviconImageId("");
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended format: Square PNG, ICO or SVG (e.g. 32x32px or 64x64px).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingLogo || uploadingFavicon}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
