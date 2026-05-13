"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { dashboardLinks } from "@/lib/site";

type DashboardNavScrollProps = {
  onNavigate?: () => void;
};

export function DashboardNavScroll({ onNavigate }: DashboardNavScrollProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [thumb, setThumb] = useState({
    height: 64,
    top: 24,
    visible: false,
  });

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
        {dashboardLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/6 hover:text-white"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
