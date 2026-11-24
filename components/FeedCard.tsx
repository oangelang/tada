"use client";

import { useState } from "react";
import { TAG_COLORS, type Tag } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Comment {
  id: string;
  text: string;
  user_id: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

interface TadaEntry {
  id: string;
  text: string;
  tag: Tag;
}

interface FeedCardProps {
  displayName: string;
  date: string;
  entries: TadaEntry[];
  totalReactions: number;
  hasReacted: boolean;
  comments: Comment[];
  onReact: () => void;
  onComment: (text: string) => void;
}

const AVATAR_COLORS = ["#FF6B2B", "#4A7BF7", "#2EC866", "#FFD23F", "#FF5DA0", "#8B6CF6"];

export default function FeedCard({
  displayName,
  date,
  entries,
  totalReactions,
  hasReacted,
  comments,
  onReact,
  onComment,
}: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const initial = displayName.charAt(0).toUpperCase();
  const colorIdx = displayName.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIdx];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white font-[var(--font-heading)] shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>
        <div>
          <span className="font-bold text-sm">{displayName}</span>
          <span className="text-xs text-[#8B8680] ml-2">{date}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {entries.map((entry) => {
          const colors = TAG_COLORS[entry.tag];
          return (
            <span
              key={entry.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: colors.dot }}
              />
              {entry.text}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onReact}
          className={`flex items-center gap-1 transition-colors font-semibold ${
            hasReacted ? "text-[#FF6B2B]" : "text-[#8B8680] hover:text-[#FF6B2B]"
          }`}
        >
          🎉 {totalReactions > 0 && totalReactions}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="text-[#8B8680] hover:text-[#4A7BF7] transition-colors flex items-center gap-1 font-semibold"
        >
          💬 {comments.length > 0 && comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-[#F0EDE4]">
          {comments.map((c) => (
            <div key={c.id} className="mb-2 text-sm">
              <span className="font-bold">{c.profiles?.display_name ?? "User"}</span>
              <span className="text-[#8B8680] text-xs ml-2">
                {format(parseISO(c.created_at), "MMM d")}
              </span>
              <p className="text-[#1A1A2E] mt-0.5">{c.text}</p>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Nice work!"
              maxLength={200}
              className="flex-1 text-sm px-3 py-2 rounded-xl border-2 border-[#E2DFD5] bg-[#FFFDF5] outline-none focus:border-[#4A7BF7]"
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  onComment(commentText.trim());
                  setCommentText("");
                }
              }}
              className="px-3 py-2 bg-[#4A7BF7] text-white rounded-xl text-sm font-bold hover:bg-[#3A67D9] transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
