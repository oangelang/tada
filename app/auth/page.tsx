"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Blobs from "@/components/Blobs";

type Tab = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/log");
    }
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");
    if (!displayName.trim()) {
      setError("Display name is required");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName.trim(),
      });
    }
    if (data.session) {
      router.push("/log");
    } else {
      setMessage("Check your email to confirm your account, then sign in.");
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "signin") handleSignIn();
    else if (tab === "signup") handleSignUp();
    else handleForgotPassword();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <Blobs />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
        </div>
        <p className="text-[#8B8680] text-sm mb-8 text-center">
          Celebrate what you actually did today.
        </p>

        <div className="flex rounded-2xl bg-[#F0EDE4] p-1 mb-6">
          {(["signin", "signup", "forgot"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setMessage(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                tab === t
                  ? "bg-white text-[#FF6B2B] shadow-sm"
                  : "text-[#8B8680]"
              }`}
            >
              {t === "signin" ? "Sign in" : t === "signup" ? "Sign up" : "Forgot"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B] transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B] transition-colors"
          />
          {tab !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B] transition-colors"
            />
          )}

          {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
          {message && <p className="text-[#2EC866] text-xs font-semibold">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#FF6B2B] to-[#FFD23F] text-white rounded-2xl font-extrabold text-sm hover:shadow-lg hover:shadow-[#FF6B2B]/30 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading
              ? "..."
              : tab === "signin"
              ? "Sign in"
              : tab === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
