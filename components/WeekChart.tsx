"use client";

import { format, subDays } from "date-fns";
import { dateKey } from "@/lib/utils";

interface WeekChartProps {
  weekData: Record<string, number>;
}

const BAR_COLORS = ["#4A7BF7", "#2EC866", "#FFD23F", "#FF6B2B", "#FF5DA0", "#8B6CF6", "#4A7BF7"];

export default function WeekChart({ weekData }: WeekChartProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return { date: dateKey(d), label: format(d, "EEE") };
  });

  const max = Math.max(...days.map((d) => weekData[d.date] || 0), 1);

  return (
    <div className="card p-4">
      <h3 className="font-bold text-sm mb-4">This week</h3>
      <div className="flex items-end gap-2 h-28">
        {days.map((day, i) => {
          const count = weekData[day.date] || 0;
          const height = count > 0 ? (count / max) * 100 : 4;
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-[#1A1A2E]">
                {count || ""}
              </span>
              <div
                className="w-full rounded-xl transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: count > 0 ? BAR_COLORS[i] : "#F0EDE4",
                }}
              />
              <span className="text-[10px] text-[#8B8680] font-bold">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
