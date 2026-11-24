"use client";

import { useState } from "react";
import { TAG_COLORS, TAGS, type Tag } from "@/lib/utils";

interface TadaChipProps {
  id: string;
  text: string;
  tag: Tag;
  editable?: boolean;
  onUpdate?: (id: string, text: string, tag: Tag) => void;
  onDelete?: (id: string) => void;
}

export default function TadaChip({
  id,
  text,
  tag,
  editable = false,
  onUpdate,
  onDelete,
}: TadaChipProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editTag, setEditTag] = useState<Tag>(tag);
  const colors = TAG_COLORS[tag];

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-[#E2DFD5] p-2.5">
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          maxLength={120}
          className="flex-1 text-sm bg-transparent outline-none"
          autoFocus
        />
        <select
          value={editTag}
          onChange={(e) => setEditTag(e.target.value as Tag)}
          className="text-xs rounded-lg border border-[#E2DFD5] p-1"
        >
          {TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={() => { onUpdate?.(id, editText, editTag); setEditing(false); }}
          className="text-xs text-[#FF6B2B] font-bold"
        >
          Save
        </button>
        <button
          onClick={() => { setEditText(text); setEditTag(tag); setEditing(false); }}
          className="text-xs text-[#8B8680]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      <span className="truncate">{text}</span>
      {editable && (
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={() => setEditing(true)}
            className="opacity-60 hover:opacity-100 text-xs"
          >
            ✏️
          </button>
          <button
            onClick={() => { if (confirm("Delete this ta-da?")) onDelete?.(id); }}
            className="opacity-60 hover:opacity-100 text-xs"
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
}
