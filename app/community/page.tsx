"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getFeedForUser,
  toggleReaction,
  addComment,
  hasUserReacted,
  followByEmail,
  getFollowingProfiles,
  unfollowUser,
} from "@/lib/queries";
import { type Tag } from "@/lib/utils";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import FeedCard from "@/components/FeedCard";
import Blobs from "@/components/Blobs";

interface FeedItem {
  id: string;
  text: string;
  tag: Tag;
  date: string;
  user_id: string;
  profiles: { display_name: string };
  reactions: { count: number }[];
  comments: {
    id: string;
    text: string;
    user_id: string;
    created_at: string;
    profiles: { display_name: string } | null;
  }[];
  _hasReacted?: boolean;
}

interface GroupedCard {
  key: string;
  displayName: string;
  date: string;
  userId: string;
  entries: { id: string; text: string; tag: Tag }[];
  totalReactions: number;
  hasReacted: boolean;
  comments: FeedItem["comments"];
  firstTadaId: string;
}

interface FollowProfile {
  id: string;
  display_name: string;
}

function groupFeed(items: FeedItem[]): GroupedCard[] {
  const map = new Map<string, GroupedCard>();
  for (const item of items) {
    const key = `${item.user_id}_${item.date}`;
    const existing = map.get(key);
    if (existing) {
      existing.entries.push({ id: item.id, text: item.text, tag: item.tag });
      existing.totalReactions += item.reactions[0]?.count || 0;
      if (item._hasReacted) existing.hasReacted = true;
      existing.comments.push(...item.comments);
    } else {
      map.set(key, {
        key,
        displayName: item.profiles?.display_name ?? "User",
        date: item.date,
        userId: item.user_id,
        entries: [{ id: item.id, text: item.text, tag: item.tag }],
        totalReactions: item.reactions[0]?.count || 0,
        hasReacted: item._hasReacted ?? false,
        comments: [...item.comments],
        firstTadaId: item.id,
      });
    }
  }
  return Array.from(map.values());
}

export default function CommunityPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FollowProfile[]>([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendError, setFriendError] = useState("");
  const [friendSuccess, setFriendSuccess] = useState("");
  const [addingFriend, setAddingFriend] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [feedData, followingProfiles] = await Promise.all([
        getFeedForUser(supabase, user.id) as Promise<FeedItem[]>,
        getFollowingProfiles(supabase, user.id) as Promise<FollowProfile[]>,
      ]);

      const withReactions = await Promise.all(
        feedData.map(async (item) => ({
          ...item,
          _hasReacted: await hasUserReacted(supabase, item.id, user.id),
        }))
      );
      setFeed(withReactions);
      setFriends(followingProfiles);
    }
    load();
  }, []);

  async function handleAddFriend() {
    if (!userId || !friendEmail.trim()) return;
    setAddingFriend(true);
    setFriendError("");
    setFriendSuccess("");
    try {
      const result = await followByEmail(supabase, userId, friendEmail.trim());
      setFriends((prev) => [...prev, result.profile]);
      setFriendSuccess(`Now following ${result.profile.display_name}!`);
      setFriendEmail("");
      const feedData = (await getFeedForUser(supabase, userId)) as FeedItem[];
      const withReactions = await Promise.all(
        feedData.map(async (item) => ({
          ...item,
          _hasReacted: await hasUserReacted(supabase, item.id, userId),
        }))
      );
      setFeed(withReactions);
    } catch (err: unknown) {
      setFriendError(err instanceof Error ? err.message : "Something went wrong");
    }
    setAddingFriend(false);
  }

  async function handleUnfollow(followingId: string) {
    if (!userId) return;
    await unfollowUser(supabase, userId, followingId);
    setFriends((prev) => prev.filter((f) => f.id !== followingId));
    const feedData = (await getFeedForUser(supabase, userId)) as FeedItem[];
    const withReactions = await Promise.all(
      feedData.map(async (item) => ({
        ...item,
        _hasReacted: await hasUserReacted(supabase, item.id, userId),
      }))
    );
    setFeed(withReactions);
  }

  async function handleReact(tadaId: string) {
    if (!userId) return;
    const added = await toggleReaction(supabase, tadaId, userId);
    setFeed((prev) =>
      prev.map((item) =>
        item.id === tadaId
          ? {
              ...item,
              _hasReacted: added,
              reactions: [
                { count: (item.reactions[0]?.count || 0) + (added ? 1 : -1) },
              ],
            }
          : item
      )
    );
  }

  async function handleComment(tadaId: string, text: string) {
    if (!userId) return;
    const comment = await addComment(supabase, tadaId, userId, text);
    const normalized = {
      ...comment,
      profiles: Array.isArray(comment.profiles)
        ? comment.profiles[0] ?? null
        : comment.profiles,
    } as FeedItem["comments"][number];
    setFeed((prev) =>
      prev.map((item) =>
        item.id === tadaId
          ? { ...item, comments: [...item.comments, normalized] }
          : item
      )
    );
  }

  const grouped = groupFeed(feed);

  return (
    <div className="min-h-screen pb-20 relative">
      <Blobs />
      <div className="max-w-lg mx-auto px-4 pt-6 relative z-10">
        <div className="mb-6">
          <Logo size="sm" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-heading)] font-extrabold text-xl">
            Community
          </h2>
          <button
            onClick={() => setShowAddFriend((s) => !s)}
            className="px-4 py-2 bg-[#4A7BF7] text-white rounded-full text-xs font-extrabold hover:bg-[#3A67D9] transition-colors shadow-sm"
          >
            + Add Friend
          </button>
        </div>

        {showAddFriend && (
          <div className="card p-4 mb-4">
            <p className="text-sm font-bold mb-2">
              Add a friend by email
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => {
                  setFriendEmail(e.target.value);
                  setFriendError("");
                  setFriendSuccess("");
                }}
                placeholder="friend@email.com"
                className="flex-1 text-sm px-3 py-2 rounded-xl border-2 border-[#E2DFD5] bg-[#FFFDF5] outline-none focus:border-[#4A7BF7]"
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              />
              <button
                onClick={handleAddFriend}
                disabled={addingFriend || !friendEmail.trim()}
                className="px-4 py-2 bg-[#4A7BF7] text-white rounded-xl text-sm font-bold hover:bg-[#3A67D9] transition-colors disabled:opacity-50"
              >
                {addingFriend ? "..." : "Add"}
              </button>
            </div>
            {friendError && (
              <p className="text-xs text-red-500 mt-2 font-semibold">{friendError}</p>
            )}
            {friendSuccess && (
              <p className="text-xs text-[#2EC866] mt-2 font-semibold">{friendSuccess}</p>
            )}

            {friends.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#F0EDE4]">
                <p className="text-xs font-bold text-[#8B8680] mb-2">
                  Following ({friends.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {friends.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#DFEAFF] text-[#1D4ED8]"
                    >
                      {f.display_name}
                      <button
                        onClick={() => handleUnfollow(f.id)}
                        className="ml-0.5 text-[#1D4ED8] hover:text-red-500 font-bold"
                        title="Unfollow"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {grouped.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-[#8B8680] text-sm font-semibold">
              {friends.length === 0
                ? "Add friends to see their ta-das here!"
                : "No ta-das from your friends yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => (
              <FeedCard
                key={group.key}
                displayName={group.displayName}
                date={group.date}
                entries={group.entries}
                totalReactions={group.totalReactions}
                hasReacted={group.hasReacted}
                comments={group.comments}
                onReact={() => handleReact(group.firstTadaId)}
                onComment={(text) => handleComment(group.firstTadaId, text)}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
