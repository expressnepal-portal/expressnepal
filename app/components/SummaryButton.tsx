"use client";

import { useEffect, useState } from "react";
import SummaryLogo from "./SummaryLogo";
import SummaryModal from "./SummaryModal";

export default function SummaryButton() {
  const [showLabel, setShowLabel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Show label automatically for 2 seconds after 5s
  useEffect(() => {
    const showTimer = setTimeout(() => setShowLabel(true), 3000);
    const hideTimer = setTimeout(() => setShowLabel(false), 4500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Fetch summary from API
  async function handleSummarize() {
    setOpenModal(true);
    setLoading(true);

    const articleText =
      document.querySelector("article")?.innerText || "No article content found.";

    try {
      const res = await fetch("/api/summarizeroute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText }),
      });

      const data = await res.json();
      setSummary(data.summary || "Could not summarize.");
    } catch (err) {
      console.error(err);
      setSummary("Error summarizing the news.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-2 z-40">
        <div
          onClick={handleSummarize}
          className={`flex items-center overflow-hidden rounded-full shadow-lg cursor-pointer transition-all duration-300
            ${showLabel ? "w-[200px]" : "w-[52px]"}
            bg-linear-to-r from-[#CC0001] to-[#004AAD]
          `}
        >
          <div className="h-[52px] w-[52px] flex items-center justify-center shrink-0">
            <SummaryLogo />
          </div>

          <span
            className={`whitespace-nowrap text-white text-sm font-medium transition-opacity duration-200
              ${showLabel ? "opacity-100 ml-2 pr-4" : "opacity-0"}
            `}
          >
            Summarize News
          </span>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <SummaryModal
          onClose={() => setOpenModal(false)}
          loading={loading}
          summary={summary}
        />
      )}
    </>
  );
}
