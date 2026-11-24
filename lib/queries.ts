import { SupabaseClient } from "@supabase/supabase-js";
import { Tag } from "./utils";

export async function getTadas(supabase: SupabaseClient, userId: string, date: string) {
  const { data, error } = await supabase
    .from("tadas")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllTadaDates(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("tadas")
    .select("date")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((r: { date: string }) => r.date);
}

export async function addTada(
  supabase: SupabaseClient,
  userId: string,
  text: string,
  tag: Tag,
  date: string,
  isPublic: boolean
) {
  const { data, error } = await supabase
    .from("tadas")
    .insert({ user_id: userId, text, tag, date, is_public: isPublic })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTada(
  supabase: SupabaseClient,
  id: string,
  text: string,
  tag: Tag
) {
  const { error } = await supabase
    .from("tadas")
    .update({ text, tag, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTada(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("tadas").delete().eq("id", id);
  if (error) throw error;
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: { display_name?: string; is_public?: boolean }
) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

export async function getFeed(supabase: SupabaseClient) {
  const { data: tadas, error } = await supabase
    .from("tadas")
    .select("id, text, tag, date, user_id, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  if (!tadas || tadas.length === 0) return [];

  const userIds = [...new Set(tadas.map((t: { user_id: string }) => t.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);
  const profileMap = new Map(
    (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name])
  );

  const tadaIds = tadas.map((t: { id: string }) => t.id);
  const { data: reactions } = await supabase
    .from("reactions")
    .select("tada_id")
    .in("tada_id", tadaIds);

  const reactionCounts = new Map<string, number>();
  (reactions || []).forEach((r: { tada_id: string }) => {
    reactionCounts.set(r.tada_id, (reactionCounts.get(r.tada_id) || 0) + 1);
  });

  const { data: comments } = await supabase
    .from("comments")
    .select("id, text, user_id, tada_id, created_at")
    .in("tada_id", tadaIds)
    .order("created_at", { ascending: true });

  type Comment = { id: string; text: string; user_id: string; tada_id: string; created_at: string };
  const commentsByTada = new Map<string, Comment[]>();
  (comments || []).forEach((c: Comment) => {
    const list = commentsByTada.get(c.tada_id) || [];
    list.push(c);
    commentsByTada.set(c.tada_id, list);
  });

  return tadas.map((t: { id: string; user_id: string; text: string; tag: string; date: string }) => ({
    ...t,
    profiles: { display_name: profileMap.get(t.user_id) || "User" },
    reactions: [{ count: reactionCounts.get(t.id) || 0 }],
    comments: (commentsByTada.get(t.id) || []).map((c: { id: string; text: string; user_id: string; created_at: string }) => ({
      ...c,
      profiles: { display_name: profileMap.get(c.user_id) || "User" },
    })),
  }));
}

export async function toggleReaction(
  supabase: SupabaseClient,
  tadaId: string,
  userId: string
) {
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("tada_id", tadaId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("reactions").insert({ tada_id: tadaId, user_id: userId });
    return true;
  }
}

export async function addComment(
  supabase: SupabaseClient,
  tadaId: string,
  userId: string,
  text: string
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ tada_id: tadaId, user_id: userId, text })
    .select("id, text, user_id, created_at")
    .single();
  if (error) throw error;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  return { ...data, profiles: profile || { display_name: "User" } };
}

export async function getUserTadasWithDates(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("tadas")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWeekTadas(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("tadas")
    .select("date, tag")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return data;
}

export async function hasUserReacted(
  supabase: SupabaseClient,
  tadaId: string,
  userId: string
) {
  const { data } = await supabase
    .from("reactions")
    .select("id")
    .eq("tada_id", tadaId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

// Friends / follows

export async function getFollowing(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) throw error;
  return (data || []).map((f: { following_id: string }) => f.following_id);
}

export async function followByEmail(
  supabase: SupabaseClient,
  followerId: string,
  email: string
) {
  // Look up user by email in profiles — we need to find the user id
  // First check auth.users isn't directly queryable, so we look up via a function
  // or we can match against the email in a creative way.
  // Since we can't query auth.users from the client, we'll use a lookup table approach.
  // Let's query all profiles and match — but we don't store email in profiles.
  // We need an API route to look up user by email using the service role.
  const res = await fetch("/api/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ follower_id: followerId, email }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to follow");
  return result;
}

export async function unfollowUser(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw error;
}

export async function getFollowingProfiles(supabase: SupabaseClient, userId: string) {
  const followingIds = await getFollowing(supabase, userId);
  if (followingIds.length === 0) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", followingIds);
  return data || [];
}

export async function getFeedForUser(supabase: SupabaseClient, userId: string) {
  const followingIds = await getFollowing(supabase, userId);
  // Include the user's own entries + people they follow
  const allIds = [...followingIds, userId];

  const { data: tadas, error } = await supabase
    .from("tadas")
    .select("id, text, tag, date, user_id, created_at")
    .eq("is_public", true)
    .in("user_id", allIds)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  if (!tadas || tadas.length === 0) return [];

  const userIds = [...new Set(tadas.map((t: { user_id: string }) => t.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);
  const profileMap = new Map(
    (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name])
  );

  const tadaIds = tadas.map((t: { id: string }) => t.id);
  const { data: reactions } = await supabase
    .from("reactions")
    .select("tada_id")
    .in("tada_id", tadaIds);

  const reactionCounts = new Map<string, number>();
  (reactions || []).forEach((r: { tada_id: string }) => {
    reactionCounts.set(r.tada_id, (reactionCounts.get(r.tada_id) || 0) + 1);
  });

  const { data: comments } = await supabase
    .from("comments")
    .select("id, text, user_id, tada_id, created_at")
    .in("tada_id", tadaIds)
    .order("created_at", { ascending: true });

  type Comment = { id: string; text: string; user_id: string; tada_id: string; created_at: string };
  const commentsByTada = new Map<string, Comment[]>();
  (comments || []).forEach((c: Comment) => {
    const list = commentsByTada.get(c.tada_id) || [];
    list.push(c);
    commentsByTada.set(c.tada_id, list);
  });

  return tadas.map((t: { id: string; user_id: string; text: string; tag: string; date: string }) => ({
    ...t,
    profiles: { display_name: profileMap.get(t.user_id) || "User" },
    reactions: [{ count: reactionCounts.get(t.id) || 0 }],
    comments: (commentsByTada.get(t.id) || []).map((c: { id: string; text: string; user_id: string; created_at: string }) => ({
      ...c,
      profiles: { display_name: profileMap.get(c.user_id) || "User" },
    })),
  }));
}
