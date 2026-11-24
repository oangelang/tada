"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
} from "@/lib/pushSubscription";

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const hasPush =
      "PushManager" in window && "serviceWorker" in navigator;
    if (!hasPush) {
      setLoading(false);
      return;
    }
    isPushSubscribed()
      .then((subscribed) => {
        setEnabled(subscribed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggle() {
    setLoading(true);
    setError("");

    if (!("PushManager" in window) || !("serviceWorker" in navigator)) {
      const isIOS =
        /iPhone|iPad/.test(navigator.userAgent) &&
        !("standalone" in navigator && (navigator as Record<string, unknown>).standalone);
      if (isIOS) {
        setError("Add to Home Screen first, then open from there");
      } else {
        setError("Notifications not supported in this browser");
      }
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not signed in");
        setLoading(false);
        return;
      }

      if (enabled) {
        await unsubscribeFromPush(supabase);
        setEnabled(false);
      } else {
        const sub = await subscribeToPush(supabase, user.id);
        if (!sub) {
          setError("Notification permission was denied");
        }
        setEnabled(!!sub);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("Notification toggle error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="mt-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            enabled ? "bg-[#2EC866]" : "bg-[#E2DFD5]"
          } ${loading ? "opacity-50" : ""}`}
          onClick={() => !loading && toggle()}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
              enabled ? "left-5" : "left-1"
            }`}
          />
        </div>
        <span className="text-sm text-[#8B8680] font-semibold">
          Daily 9 PM reminder
        </span>
      </label>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-12">{error}</p>
      )}
    </div>
  );
}
