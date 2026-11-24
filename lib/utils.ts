import { format, parseISO, differenceInDays, subDays } from "date-fns";

export function dateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function formatDateLabel(d: Date): string {
  const today = new Date();
  const todayStr = dateKey(today);
  const yesterdayStr = dateKey(subDays(today, 1));
  const key = dateKey(d);

  if (key === todayStr) return "Today";
  if (key === yesterdayStr) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export function calcStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  if (!sorted.length) return 0;
  const todayStr = dateKey(new Date());
  const yesterdayStr = dateKey(subDays(new Date(), 1));
  if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) return 0;
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export const TAGS = ["Self-Care", "Work", "Home", "Social", "Other"] as const;
export type Tag = (typeof TAGS)[number];

export const TAG_COLORS: Record<
  Tag,
  { bg: string; text: string; dot: string }
> = {
  "Self-Care": { bg: "#FFE0F0", text: "#B8245A", dot: "#FF5DA0" },
  Work: { bg: "#DFEAFF", text: "#1D4ED8", dot: "#4A7BF7" },
  Home: { bg: "#D4F5E0", text: "#15803D", dot: "#2EC866" },
  Social: { bg: "#FFF1CC", text: "#A16207", dot: "#FFB800" },
  Other: { bg: "#EDE9FE", text: "#6D28D9", dot: "#8B6CF6" },
};

export const TAG_PLACEHOLDERS: Record<Tag, string> = {
  "Self-Care": "Went for a walk, drank water...",
  Work: "Finished report, sent emails...",
  Home: "Did laundry, cooked dinner...",
  Social: "Called a friend, went to lunch...",
  Other: "Learned something new, ran errands...",
};

export const TAG_QUICK_ADDS: Record<Tag, string[]> = {
  "Self-Care": ["Drank enough water", "Went for a walk", "Got enough sleep", "Stretched", "Took a break"],
  Work: ["Cleared my inbox", "Finished a task", "Had a good meeting", "Hit a deadline", "Helped a coworker"],
  Home: ["Did laundry", "Cooked a meal", "Cleaned up", "Took out trash", "Went grocery shopping"],
  Social: ["Called a friend", "Went out for coffee", "Texted someone back", "Made plans", "Caught up with family"],
  Other: ["Learned something new", "Read a chapter", "Ran an errand", "Tried something different", "Stayed organized"],
};
