"use client";

import { useEffect, useRef, useMemo } from "react";

interface Rect {
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  speed: number;
  /** Full border CSS value including color with baked-in alpha */
  borderCss: string;
  /** Optional background with baked-in alpha */
  bgCss: string | null;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateRects(count: number): Rect[] {
  const rand = seededRandom(42);
  const rects: Rect[] = [];

  for (let i = 0; i < count; i++) {
    const sizeClass = rand();
    let w: number, h: number;
    if (sizeClass < 0.25) {
      w = 4 + rand() * 10;
      h = 3 + rand() * 8;
    } else if (sizeClass < 0.6) {
      w = 12 + rand() * 22;
      h = 10 + rand() * 18;
    } else if (sizeClass < 0.85) {
      w = 28 + rand() * 25;
      h = 22 + rand() * 20;
    } else {
      w = 45 + rand() * 35;
      h = 35 + rand() * 30;
    }

    const x = -20 + rand() * 120;
    const y = -30 + rand() * 280;
    const rot = rand() * 360;
    const speed = 0.04 + rand() * 0.30;

    // Color
    const hue = 188 + rand() * 28;
    const chroma = 0.07 + rand() * 0.07;
    const lightness = 0.50 + rand() * 0.20;

    // Border: bake alpha directly into the color so no element-level opacity needed
    const borderAlpha = 0.18 + rand() * 0.35; // 18-53%
    const bw = rand() < 0.4 ? 2 : 1;
    const borderCss = `${bw}px solid oklch(${lightness.toFixed(2)} ${chroma.toFixed(3)} ${hue.toFixed(0)} / ${borderAlpha.toFixed(2)})`;

    // ~50% get a fill
    const hasFill = rand() < 0.50;
    const fillAlpha = 0.04 + rand() * 0.08;
    const bgCss = hasFill
      ? `oklch(${(lightness * 0.7).toFixed(2)} ${(chroma * 0.6).toFixed(3)} ${hue.toFixed(0)} / ${fillAlpha.toFixed(3)})`
      : null;

    rects.push({ w, h, x, y, rot, speed, borderCss, bgCss });
  }

  return rects;
}

const RECT_COUNT = 40;

export function BackgroundOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rects = useMemo(() => generateRects(RECT_COUNT), []);

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
          const speed = rects[i]?.speed ?? 0.12;
          const rot = rects[i]?.rot ?? 0;
          el.style.transform = `translateY(${-scrollY * speed}px) rotate(${rot}deg)`;
        }
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [rects]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden hidden dark:block"
    >
      {rects.map((rect, i) => (
        <div
          key={i}
          className="absolute will-change-transform"
          style={{
            width: `${rect.w}vw`,
            height: `${rect.h}vw`,
            left: `${rect.x}vw`,
            top: `${rect.y}vh`,
            border: rect.borderCss,
            borderRadius: "4px",
            transform: `rotate(${rect.rot}deg)`,
            ...(rect.bgCss ? { backgroundColor: rect.bgCss } : {}),
          }}
        />
      ))}
    </div>
  );
}
