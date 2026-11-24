"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserTadasWithDates } from "@/lib/queries";
import { calcStreak, dateKey, type Tag } from "@/lib/utils";
import { subDays } from "date-fns";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import WeekChart from "@/components/WeekChart";
import TagBars from "@/components/TagBars";
import InsightCard from "@/components/InsightCard";
import Blobs from "@/components/Blobs";

export default function TrendsPage() {
  const [streak, setStreak] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [weekData, setWeekData] = useState<Record<string, number>>({});
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [topTag, setTopTag] = useState<Tag | null>(null);
  const [bestDay, setBestDay] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tadas = await getUserTadasWithDates(supabase, user.id);
      const dates = tadas.map((t: { date: string }) => t.date);

      setStreak(calcStreak(dates));
      setTotalCount(tadas.length);

      const today = new Date();
      const week: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const key = dateKey(subDays(today, i));
        week[key] = tadas.filter((t: { date: string }) => t.date === key).length;
      }
      setWeekData(week);

      const tags: Record<string, number> = {};
      tadas.forEach((t: { tag: string }) => {
        tags[t.tag] = (tags[t.tag] || 0) + 1;
      });
      setTagCounts(tags);

      const sorted = Object.entries(tags).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) setTopTag(sorted[0][0] as Tag);

      const dateCounts: Record<string, number> = {};
      dates.forEach((d: string) => { dateCounts[d] = (dateCounts[d] || 0) + 1; });
      const best = Math.max(...Object.values(dateCounts), 0);
      setBestDay(best);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20 relative">
      <Blobs />
      <div className="max-w-lg mx-auto px-4 pt-6 relative z-10">
        <div className="mb-6">
          <Logo size="sm" />
        </div>

        <h2 className="font-[var(--font-heading)] font-extrabold text-xl mb-4">
          Your trends
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Current streak" value={streak} icon="🔥" />
          <StatCard label="Total ta-das" value={totalCount} icon="✨" />
          <StatCard label="Best day" value={bestDay} icon="🏆" />
          <StatCard label="Categories" value={Object.keys(tagCounts).length} icon="🏷" />
        </div>

        <div className="mb-4">
          <InsightCard streak={streak} totalCount={totalCount} topTag={topTag} />
        </div>

        <div className="mb-4">
          <WeekChart weekData={weekData} />
        </div>

        <TagBars tagCounts={tagCounts} />
      </div>
      <BottomNav />
    </div>
  );
}
