"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A thin decorative line ("roter Faden") that flows through the page background.
 * Uses the CTA orange-red color and gently curves across the full page height.
 */
export function RedThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pageHeight, setPageHeight] = useState(3000);

  useEffect(() => {
    function measure() {
      setPageHeight(document.documentElement.scrollHeight);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  // Generate a flowing bezier path that meanders left-right through the page
  const segments = Math.ceil(pageHeight / 600);
  let d = "M 50,0";
  for (let i = 0; i < segments; i++) {
    const y1 = i * 600 + 200;
    const y2 = i * 600 + 400;
    const yEnd = (i + 1) * 600;
    // Alternate between left and right curves
    const xPeak = i % 2 === 0 ? 85 : 15;
    const xReturn = i % 2 === 0 ? 20 : 80;
    d += ` C ${xPeak},${y1} ${xReturn},${y2} ${i % 2 === 0 ? 35 : 65},${yEnd}`;
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full"
      style={{ height: pageHeight }}
      viewBox={`0 0 100 ${pageHeight}`}
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d={d}
        stroke="oklch(64.15% 0.2447 30.41)"
        strokeWidth="0.15"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
