import { TAG_COLORS, type Tag } from "@/lib/utils";

export default function TagPill({
  tag,
  selected,
  onClick,
}: {
  tag: Tag;
  selected?: boolean;
  onClick?: () => void;
}) {
  const colors = TAG_COLORS[tag];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all"
      style={{
        backgroundColor: selected ? colors.dot : colors.bg,
        color: selected ? "white" : colors.text,
        boxShadow: selected ? `0 2px 8px ${colors.dot}50` : "none",
      }}
    >
      {!selected && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.dot }}
        />
      )}
      {tag}
    </button>
  );
}
