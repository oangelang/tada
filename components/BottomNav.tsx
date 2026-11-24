"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/log", label: "Log", icon: "✏️" },
  { href: "/trends", label: "Trends", icon: "📊" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#E2DFD5] z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
                active ? "text-[#FF6B2B]" : "text-[#8B8680]"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className={active ? "font-bold" : "font-semibold"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
