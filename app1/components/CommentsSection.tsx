"use client";

import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  date: string;
  author?: {
    node?: {
      name?: string;
    };
  };
};

type Props = {
  postId: number;
  initialCount: number;
  initialComments: Comment[];
};

export default function CommentsSection({
  postId,
  initialCount,
  initialComments,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [count, setCount] = useState<number>(initialCount);
  const [content, setContent] = useState("");

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    // Create a temporary comment for optimistic update
    const newComment: Comment = {
      id: `temp-${Date.now()}`,
      content,
      date: new Date().toISOString(),
      author: { node: { name: "Anonymous" } },
    };

    // Update state immediately
    setComments((prev) => [newComment, ...prev]);
    setCount((c) => c + 1);
    setContent("");

    try {
      await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          name: "Anonymous",
          email: "anonymous@example.com",
          content,
        }),
      });
      // Optionally: replace temp ID with real ID when backend responds
    } catch (err) {
      console.error("Error posting comment:", err);
      // Optionally: rollback optimistic update
    }
  }

  return (
    <section className="mt-16 rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-7 max-h-[90%] overflow-auto">
      {/* TITLE */}
      <h2 className="text-lg md:text-xl font-semibold text-nepal-black mb-5">
        {count} Commented
      </h2>

      {/* COMMENTS */}
      <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment.</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-3">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">
                {comment.author?.node?.name || "Anonymous"}
              </span>
              <time>{new Date(comment.date).toLocaleDateString()}</time>
            </div>

            <div
              className="text-gray-800 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={submitComment} className="space-y-3">
        <textarea
          placeholder="Write your comment…"
          required
          rows={3}
          className="w-full rounded-lg border border-gray-300 p-5 text-sm focus:outline-none focus:ring-2 focus:ring-nepal-orange"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          className="bg-nepal-orange text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#d32a2a] transition text-sm"
        >
          Post Comment
        </button>
      </form>
    </section>
  );
}
