"use client";

import { TAG_COLORS, TAGS, type Tag } from "@/lib/utils";

interface PendingChipProps {
  text: string;
  tag: Tag;
  onTagChange: (tag: Tag) => void;
  onRemove: () => void;
}

export default function PendingChip({ text, tag, onTagChange, onRemove }: PendingChipProps) {
  const colors = TAG_COLORS[tag];

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border-2 border-dashed"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.dot,
      }}
    >
      <select
        value={tag}
        onChange={(e) => onTagChange(e.target.value as Tag)}
        className="bg-transparent text-xs font-bold outline-none cursor-pointer"
        style={{ color: colors.text }}
      >
        {TAGS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <span className="truncate">{text}</span>
      <button
        onClick={onRemove}
        className="opacity-60 hover:opacity-100 ml-1 text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
