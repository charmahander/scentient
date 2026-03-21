"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Grid3x3, Compass, MessageCircle } from "lucide-react";

const tabs = [
  { href: "/", icon: Sparkles, label: "Today" },
  { href: "/collection", icon: Grid3x3, label: "Collection" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/chat", icon: MessageCircle, label: "Advisor" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-dark"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              style={{
                color: active ? "var(--accent)" : "var(--foreground-subtle)",
              }}
            >
              <div
                className="relative"
                style={{
                  filter: active ? "drop-shadow(0 0 8px var(--accent))" : "none",
                }}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                {active && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </div>
              <span
                className="text-xs font-medium tracking-wide"
                style={{ fontSize: "10px" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
