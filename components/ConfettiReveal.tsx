"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { TAG_COLORS, type Tag } from "@/lib/utils";

interface RevealProps {
  entries: { text: string; tag: Tag }[];
  onContinue: () => void;
  onViewTrends: () => void;
}

export default function ConfettiReveal({ entries, onContinue, onViewTrends }: RevealProps) {
  useEffect(() => {
    const colors = ["#FF6B2B", "#FFD23F", "#2EC866", "#4A7BF7", "#FF5DA0", "#8B6CF6"];
    const opts = { colors, startVelocity: 40, gravity: 0.8, ticks: 250 };
    const timer1 = setTimeout(() => {
      confetti({ ...opts, particleCount: 80, spread: 90, origin: { x: 0.5, y: 0.3 } });
    }, 100);
    const timer2 = setTimeout(() => {
      confetti({ ...opts, particleCount: 60, spread: 110, origin: { x: 0.2, y: 0.2 } });
    }, 350);
    const timer3 = setTimeout(() => {
      confetti({ ...opts, particleCount: 60, spread: 110, origin: { x: 0.8, y: 0.2 } });
    }, 550);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#FFFDF5] flex flex-col items-center justify-center px-6">
      <h1 className="font-[var(--font-heading)] font-extrabold text-5xl mb-2 bg-gradient-to-r from-[#FF6B2B] via-[#FFD23F] to-[#2EC866] bg-clip-text text-transparent">
        Ta-da!
      </h1>
      <p className="text-[#8B8680] mb-8 text-center text-lg">Look what you accomplished!</p>

      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-sm">
        {entries.map((entry, i) => {
          const colors = TAG_COLORS[entry.tag];
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors.dot }}
              />
              {entry.text}
            </span>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-[#FF6B2B] text-white rounded-2xl font-bold text-sm hover:bg-[#E0501A] transition-colors shadow-lg shadow-[#FF6B2B]/20"
        >
          Keep logging
        </button>
        <button
          onClick={onViewTrends}
          className="px-6 py-3 border-2 border-[#FF6B2B] text-[#FF6B2B] rounded-2xl font-bold text-sm hover:bg-[#FFF3EC] transition-colors"
        >
          View trends
        </button>
      </div>
    </div>
  );
}
