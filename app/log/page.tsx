"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTadas, addTada, updateTada, deleteTada, getAllTadaDates, getProfile } from "@/lib/queries";
import { dateKey, TAGS, TAG_PLACEHOLDERS, TAG_QUICK_ADDS, TAG_COLORS, type Tag } from "@/lib/utils";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import DateBar from "@/components/DateBar";
import TagPill from "@/components/TagPill";
import TadaChip from "@/components/TadaChip";
import PendingChip from "@/components/PendingChip";
import ConfettiReveal from "@/components/ConfettiReveal";
import Blobs from "@/components/Blobs";

interface PendingEntry {
  text: string;
  tag: Tag;
}

interface TadaEntry {
  id: string;
  text: string;
  tag: Tag;
  date: string;
}

export default function LogPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tadaDates, setTadaDates] = useState<string[]>([]);
  const [existingTadas, setExistingTadas] = useState<TadaEntry[]>([]);
  const [pending, setPending] = useState<PendingEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag>("Work");
  const [showReveal, setShowReveal] = useState(false);
  const [revealEntries, setRevealEntries] = useState<PendingEntry[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const loadData = useCallback(async (userId: string, date: string) => {
    const [tadas, dates] = await Promise.all([
      getTadas(supabase, userId, date),
      getAllTadaDates(supabase, userId),
    ]);
    setExistingTadas(tadas);
    setTadaDates(dates);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const profile = await getProfile(supabase, user.id).catch(() => null);
      if (profile) setIsPublic(profile.is_public);
      loadData(user.id, dateKey(selectedDate));
    }
    init();
  }, []);

  useEffect(() => {
    if (user) loadData(user.id, dateKey(selectedDate));
  }, [selectedDate, user]);

  function addPending() {
    if (!inputText.trim()) return;
    setPending((p) => [...p, { text: inputText.trim(), tag: selectedTag }]);
    setInputText("");
  }

  async function handleSubmit() {
    if (!user || pending.length === 0) return;
    const date = dateKey(selectedDate);
    await Promise.all(
      pending.map((p) => addTada(supabase, user.id, p.text, p.tag, date, isPublic))
    );
    setRevealEntries([...pending]);
    setPending([]);
    setShowReveal(true);
    loadData(user.id, date);
  }

  async function handleUpdate(id: string, text: string, tag: Tag) {
    await updateTada(supabase, id, text, tag);
    if (user) loadData(user.id, dateKey(selectedDate));
  }

  async function handleDelete(id: string) {
    await deleteTada(supabase, id);
    if (user) loadData(user.id, dateKey(selectedDate));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addPending();
    }
  }

  if (showReveal) {
    return (
      <ConfettiReveal
        entries={revealEntries}
        onContinue={() => setShowReveal(false)}
        onViewTrends={() => router.push("/trends")}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <Blobs />
      <div className="max-w-lg mx-auto px-4 pt-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
        </div>

        <DateBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          tadaDates={tadaDates}
        />

        {existingTadas.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-[#8B8680] mb-2">
              Logged ({existingTadas.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {existingTadas.map((t) => (
                <TadaChip
                  key={t.id}
                  id={t.id}
                  text={t.text}
                  tag={t.tag as Tag}
                  editable
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-extrabold text-[#1A1A2E] mb-3">
            What did you get done?
          </h3>

          <div className="flex gap-2 mb-3 flex-wrap">
            {TAGS.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                selected={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={TAG_PLACEHOLDERS[selectedTag]}
              maxLength={120}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B] transition-colors"
            />
            <button
              onClick={addPending}
              disabled={!inputText.trim()}
              className="px-4 py-3 bg-[#FFD23F] text-[#1A1A2E] rounded-2xl font-extrabold text-sm hover:bg-[#FFC107] transition-colors disabled:opacity-40 shadow-sm"
            >
              + Add
            </button>
          </div>

          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {TAG_QUICK_ADDS[selectedTag].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setPending((p) => [...p, { text: suggestion, tag: selectedTag }]);
                }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: TAG_COLORS[selectedTag].bg,
                  color: TAG_COLORS[selectedTag].text,
                  borderColor: TAG_COLORS[selectedTag].dot + "40",
                }}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>

        {pending.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold text-[#8B8680] mb-2">
              Ready to submit ({pending.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {pending.map((p, i) => (
                <PendingChip
                  key={i}
                  text={p.text}
                  tag={p.tag}
                  onTagChange={(tag) =>
                    setPending((prev) =>
                      prev.map((item, j) => (j === i ? { ...item, tag } : item))
                    )
                  }
                  onRemove={() =>
                    setPending((prev) => prev.filter((_, j) => j !== i))
                  }
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B2B] to-[#FFD23F] text-white rounded-2xl font-extrabold text-sm hover:shadow-lg hover:shadow-[#FF6B2B]/30 transition-all active:scale-[0.98]"
            >
              🎉 Ta-da! Submit {pending.length} {pending.length === 1 ? "win" : "wins"}
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
