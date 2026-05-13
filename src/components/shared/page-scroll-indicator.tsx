"use client";

import { useEffect, useState } from "react";

export function PageScrollIndicator() {
  const [thumb, setThumb] = useState({
    height: 64,
    top: 0,
    visible: false,
  });

  useEffect(() => {
    let frame = 0;

    function updateThumb() {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const documentElement = document.documentElement;
        const scrollTop = window.scrollY || documentElement.scrollTop;
        const scrollHeight = documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const canScroll = scrollHeight > viewportHeight + 1;
        const trackPadding = 16;
        const trackHeight = Math.max(viewportHeight - trackPadding * 2, 1);
        const thumbHeight = Math.max(
          Math.round((viewportHeight / scrollHeight) * trackHeight),
          56
        );
        const scrollableDistance = Math.max(scrollHeight - viewportHeight, 1);
        const maxTop = trackPadding + trackHeight - thumbHeight;
        const nextTop =
          trackPadding +
          Math.round(
            (scrollTop / scrollableDistance) * (trackHeight - thumbHeight)
          );

        setThumb({
          height: thumbHeight,
          top: Math.min(Math.max(nextTop, trackPadding), maxTop),
          visible: canScroll,
        });
      });
    }

    updateThumb();

    window.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-4 right-1.5 top-4 z-[80] w-1.5 rounded-full bg-white/[0.06] transition-opacity md:right-2 ${
        thumb.visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute left-0 w-full rounded-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-teal-500 shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-[height,top] duration-150"
        style={{
          height: `${thumb.height}px`,
          top: `${thumb.top - 16}px`,
        }}
      />
    </div>
  );
}
