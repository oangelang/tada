"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Blobs from "@/components/Blobs";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/log");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <Blobs />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-lg font-extrabold mb-6 text-center">Set new password</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B]"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2DFD5] bg-white text-sm outline-none focus:border-[#FF6B2B]"
          />
          {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#FF6B2B] to-[#FFD23F] text-white rounded-2xl font-extrabold text-sm hover:shadow-lg hover:shadow-[#FF6B2B]/30 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
