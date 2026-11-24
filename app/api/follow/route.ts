import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Look up user by email using admin client
  const { data: userData, error: lookupError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (lookupError) {
    return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
  }

  const targetUser = userData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!targetUser) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  if (targetUser.id === user.id) {
    return NextResponse.json(
      { error: "You can't follow yourself" },
      { status: 400 }
    );
  }

  // Check if already following
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUser.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Already following this person" },
      { status: 400 }
    );
  }

  // Insert follow
  const { error: insertError } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUser.id });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Get the followed user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", targetUser.id)
    .single();

  return NextResponse.json({
    success: true,
    profile: profile || { id: targetUser.id, display_name: email },
  });
}
