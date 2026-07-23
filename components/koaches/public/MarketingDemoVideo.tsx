"use client";

import { useEffect, useRef, useState } from "react";

type MarketingDemoVideoProps = {
  src: string;
  className?: string;
};

/** Loads large demo videos only when scrolled into view (preload=none until then). */
export function MarketingDemoVideo({ src, className }: MarketingDemoVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      /* autoplay may be blocked — controls remain */
    });
  }, [active, src]);

  return (
    <div ref={ref} className={className}>
      {active ? (
        <video
          ref={videoRef}
          key={src}
          className="h-full w-full object-contain object-top"
          src={src}
          muted
          loop
          playsInline
          controls
          preload="metadata"
        />
      ) : (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-black text-sm text-white/60">
          Loading preview…
        </div>
      )}
    </div>
  );
}
