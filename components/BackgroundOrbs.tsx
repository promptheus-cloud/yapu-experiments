"use client";

import { useEffect, useRef } from "react";

interface Orb {
  /** CSS width/height */
  size: string;
  /** Initial position (CSS top/left) */
  x: string;
  y: string;
  /** Radial gradient color (oklch) */
  color: string;
  /** Parallax speed factor — higher = moves more against scroll */
  speed: number;
}

const orbs: Orb[] = [
  // Large teal glow — top center
  { size: "120vw", x: "-10vw", y: "-30vh", color: "oklch(0.50 0.13 195)", speed: 0.15 },
  // Mint glow — left
  { size: "60vw", x: "-20vw", y: "20vh", color: "oklch(0.45 0.12 194)", speed: 0.25 },
  // Teal glow — right
  { size: "50vw", x: "70vw", y: "50vh", color: "oklch(0.40 0.11 210)", speed: 0.20 },
  // Bottom glow
  { size: "80vw", x: "10vw", y: "80vh", color: "oklch(0.45 0.12 195)", speed: 0.30 },
  // Small accent — mid right
  { size: "30vw", x: "60vw", y: "30vh", color: "oklch(0.35 0.10 200)", speed: 0.35 },
];

export function BackgroundOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const children = container!.children;
        for (let i = 0; i < children.length; i++) {
          const el = children[i] as HTMLElement;
          const speed = orbs[i]?.speed ?? 0.2;
          el.style.transform = `translateY(${-scrollY * speed}px)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block"
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}
