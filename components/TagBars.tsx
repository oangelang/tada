import { TAG_COLORS, TAGS, type Tag } from "@/lib/utils";

interface TagBarsProps {
  tagCounts: Record<string, number>;
}

export default function TagBars({ tagCounts }: TagBarsProps) {
  const total = Object.values(tagCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="card p-4">
      <h3 className="font-bold text-sm mb-3">By category</h3>
      <div className="space-y-2.5">
        {TAGS.map((tag) => {
          const count = tagCounts[tag] || 0;
          const pct = (count / total) * 100;
          const colors = TAG_COLORS[tag as Tag];
          return (
            <div key={tag}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold" style={{ color: colors.text }}>
                  {tag}
                </span>
                <span className="text-[#8B8680] font-semibold">{count}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F0EDE4] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: colors.dot }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
