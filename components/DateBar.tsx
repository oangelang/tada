"use client";

import { useState } from "react";
import { addDays, subDays } from "date-fns";
import { formatDateLabel, dateKey } from "@/lib/utils";
import MiniCalendar from "./MiniCalendar";

interface DateBarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tadaDates: string[];
}

export default function DateBar({ selectedDate, onDateChange, tadaDates }: DateBarProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const isToday = dateKey(selectedDate) === dateKey(new Date());

  return (
    <div className="relative">
      <div className="flex items-center justify-between card px-4 py-3">
        <button
          onClick={() => onDateChange(subDays(selectedDate, 1))}
          className="text-[#8B8680] hover:text-[#FF6B2B] transition-colors text-lg font-bold"
        >
          ‹
        </button>
        <button
          onClick={() => setShowCalendar((s) => !s)}
          className="flex items-center gap-2 font-bold text-[#1A1A2E]"
        >
          <span>{formatDateLabel(selectedDate)}</span>
          <span className="text-[#8B8680] text-sm">📅</span>
        </button>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          className={`text-lg font-bold transition-colors ${
            isToday ? "text-[#E2DFD5] cursor-not-allowed" : "text-[#8B8680] hover:text-[#FF6B2B]"
          }`}
          disabled={isToday}
        >
          ›
        </button>
      </div>

      {showCalendar && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40">
          <MiniCalendar
            selectedDate={selectedDate}
            onSelect={(d) => { onDateChange(d); setShowCalendar(false); }}
            tadaDates={tadaDates}
          />
        </div>
      )}
    </div>
  );
}
