"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isAfter,
} from "date-fns";
import { dateKey } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  tadaDates: string[];
}

export default function MiniCalendar({ selectedDate, onSelect, tadaDates }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate));
  const today = new Date();
  const tadaSet = new Set(tadaDates);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="card p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="text-[#8B8680] hover:text-[#FF6B2B] px-2 font-bold"
        >
          ‹
        </button>
        <span className="font-bold text-sm">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="text-[#8B8680] hover:text-[#FF6B2B] px-2 font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#8B8680] mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1 font-semibold">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((day) => {
          const key = dateKey(day);
          const isSelected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, viewMonth);
          const hasTada = tadaSet.has(key);
          const isFuture = isAfter(day, today);

          return (
            <button
              key={key}
              onClick={() => !isFuture && onSelect(day)}
              disabled={isFuture}
              className={`relative py-1.5 rounded-xl transition-colors font-semibold ${
                isSelected
                  ? "bg-[#FF6B2B] text-white"
                  : inMonth
                  ? isFuture
                    ? "text-[#E2DFD5]"
                    : "text-[#1A1A2E] hover:bg-[#FFF3EC]"
                  : "text-[#E2DFD5]"
              }`}
            >
              {format(day, "d")}
              {hasTada && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2EC866]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
