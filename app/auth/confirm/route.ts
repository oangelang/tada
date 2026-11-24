import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // If this was a recovery flow, redirect to reset-password page
    if (data?.session?.user?.recovery_sent_at) {
      return NextResponse.redirect(new URL("/auth/reset-password", request.url));
    }
    return NextResponse.redirect(new URL("/log", request.url));
  }

  if (token_hash && type) {
    await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery",
    });
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/auth/reset-password", request.url));
    }
  }

  return NextResponse.redirect(new URL("/log", request.url));
}
