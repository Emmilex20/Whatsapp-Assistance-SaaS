"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

type DashboardNavScrollProps = {
  onNavigate?: () => void;
};

export function DashboardNavScroll({ onNavigate }: DashboardNavScrollProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const [thumb, setThumb] = useState({
    height: 64,
    top: 24,
    visible: false,
  });

  const activeHref =
    dashboardLinks
      .filter((item) => {
        if (item.href === "/dashboard") {
          return pathname === item.href;
        }

        return pathname === item.href || pathname.startsWith(`${item.href}/`);
      })
      .sort((a, b) => b.href.length - a.href.length)[0]?.href || "";

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    function updateThumb() {
      const currentElement = scrollRef.current;

      if (!currentElement) return;

      const { scrollTop, scrollHeight, clientHeight } = currentElement;
      const canScroll = scrollHeight > clientHeight + 1;
      const trackPadding = 24;
      const trackHeight = Math.max(clientHeight - trackPadding * 2, 1);
      const thumbHeight = Math.max(
        Math.round((clientHeight / scrollHeight) * trackHeight),
        56
      );
      const maxThumbTop = trackPadding + trackHeight - thumbHeight;
      const scrollableDistance = Math.max(scrollHeight - clientHeight, 1);
      const nextTop =
        trackPadding +
        Math.round((scrollTop / scrollableDistance) * (trackHeight - thumbHeight));

      setThumb({
        height: thumbHeight,
        top: Math.min(Math.max(nextTop, trackPadding), maxThumbTop),
        visible: canScroll,
      });
    }

    updateThumb();

    element.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative mt-8 min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
      <div
        className={`pointer-events-none absolute bottom-6 right-2 top-6 z-10 w-1 rounded-full bg-white/[0.06] transition-opacity ${
          thumb.visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute left-0 w-full rounded-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-teal-500 shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-[height,top] duration-150"
          style={{
            height: `${thumb.height}px`,
            top: `${thumb.top - 24}px`,
          }}
        />
      </div>

      <nav
        ref={scrollRef}
        className="dashboard-nav-scroll h-full space-y-1 overflow-y-auto p-2 pr-5"
      >
        {dashboardLinks.map((item) => {
          const active = activeHref === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-sm transition duration-200",
                active
                  ? "border-emerald-400/25 bg-[linear-gradient(90deg,rgba(16,185,129,0.24),rgba(16,185,129,0.10),rgba(255,255,255,0.035))] text-white shadow-[0_0_24px_rgba(16,185,129,0.14)]"
                  : "border-transparent text-zinc-400 hover:border-white/5 hover:bg-white/6 hover:text-white"
              )}
            >
              {active && (
                <>
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-emerald-300 to-teal-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
                  <span className="absolute inset-0 bg-emerald-400/5" />
                </>
              )}

              <span
                className={cn(
                  "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-emerald-400/12 text-emerald-200"
                    : "text-zinc-400 group-hover:text-white"
                )}
              >
                <item.icon size={18} />
              </span>

              <span
                className={cn(
                  "relative min-w-0 truncate transition",
                  active
                    ? "font-semibold text-white"
                    : "font-medium text-zinc-400 group-hover:text-white"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
