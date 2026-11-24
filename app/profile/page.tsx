"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile, getUserTadasWithDates } from "@/lib/queries";
import { TAG_COLORS, type Tag } from "@/lib/utils";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import PublicToggle from "@/components/PublicToggle";
import NotificationToggle from "@/components/NotificationToggle";
import Blobs from "@/components/Blobs";

interface TadaEntry {
  id: string;
  text: string;
  tag: Tag;
  date: string;
}

const AVATAR_COLORS = ["#FF6B2B", "#4A7BF7", "#2EC866", "#FFD23F", "#FF5DA0", "#8B6CF6"];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [history, setHistory] = useState<TadaEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? "");

      const profile = await getProfile(supabase, user.id).catch(() => null);
      if (profile) {
        setDisplayName(profile.display_name);
        setIsPublic(profile.is_public);
      }

      const tadas = await getUserTadasWithDates(supabase, user.id);
      setHistory(tadas as TadaEntry[]);
    }
    load();
  }, []);

  async function handleTogglePublic(value: boolean) {
    setIsPublic(value);
    if (userId) await updateProfile(supabase, userId, { is_public: value });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  const grouped = history.reduce<Record<string, TadaEntry[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t);
    return acc;
  }, {});

  const colorIdx = displayName.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIdx] || "#FF6B2B";

  return (
    <div className="min-h-screen pb-20 relative">
      <Blobs />
      <div className="max-w-lg mx-auto px-4 pt-6 relative z-10">
        <div className="mb-6">
          <Logo size="sm" />
        </div>

        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold text-white font-[var(--font-heading)]"
              style={{ backgroundColor: avatarColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-extrabold text-lg">{displayName}</h2>
              <p className="text-sm text-[#8B8680]">{email}</p>
            </div>
          </div>
          <PublicToggle isPublic={isPublic} onChange={handleTogglePublic} />
          <NotificationToggle />
        </div>

        <div className="mb-4">
          <h3 className="font-[var(--font-heading)] font-extrabold text-lg mb-3">
            All ta-das ({history.length})
          </h3>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mb-4">
              <p className="text-xs font-bold text-[#8B8680] mb-2">{date}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((t) => {
                  const colors = TAG_COLORS[t.tag];
                  return (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.dot }}
                      />
                      {t.text}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-[#8B8680] text-sm text-center py-8 font-semibold">
              No ta-das yet. Start logging your wins!
            </p>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-3 border-2 border-[#E2DFD5] text-[#8B8680] rounded-2xl font-bold text-sm hover:border-red-300 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
