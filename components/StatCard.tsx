interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

const ICON_COLORS: Record<string, string> = {
  "🔥": "#FF6B2B",
  "✨": "#FFD23F",
  "🏆": "#2EC866",
  "🏷": "#4A7BF7",
};

export default function StatCard({ label, value, icon }: StatCardProps) {
  const accent = ICON_COLORS[icon] || "#FF6B2B";

  return (
    <div className="card p-4 flex flex-col items-center gap-1 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-[18px]"
        style={{ backgroundColor: accent }}
      />
      <span className="text-2xl mt-1">{icon}</span>
      <span className="text-2xl font-extrabold text-[#1A1A2E] font-[var(--font-heading)]">
        {value}
      </span>
      <span className="text-xs text-[#8B8680] font-bold">{label}</span>
    </div>
  );
}
