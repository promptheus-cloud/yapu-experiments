"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A thin decorative line ("roter Faden") that flows through the page background.
 * Uses the CTA orange-red color and smoothly curves across the full page height.
 * S (smooth cubic bezier) commands ensure tangent continuity — no corners.
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

  // Build a smooth flowing path using S (smooth cubic) for tangent continuity
  const segmentH = 800;
  const segments = Math.ceil(pageHeight / segmentH);

  // Waypoints alternate left ↔ right
  const points: { x: number; y: number }[] = [{ x: 45, y: 0 }];
  for (let i = 1; i <= segments; i++) {
    points.push({
      x: i % 2 === 0 ? 40 + Math.sin(i * 1.3) * 10 : 60 + Math.cos(i * 0.9) * 10,
      y: i * segmentH,
    });
  }

  // First segment: full C command
  let d = `M ${points[0].x},${points[0].y}`;
  if (points.length > 1) {
    const cp1x = points[0].x + 25;
    const cp1y = (points[0].y + points[1].y) * 0.33;
    const cp2x = points[1].x - 20;
    const cp2y = (points[0].y + points[1].y) * 0.66;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[1].x},${points[1].y}`;
  }

  // Remaining segments: S command (mirrors previous control point → smooth)
  for (let i = 2; i < points.length; i++) {
    const cp2x = points[i].x + (i % 2 === 0 ? -20 : 20);
    const cp2y = points[i - 1].y + (points[i].y - points[i - 1].y) * 0.66;
    d += ` S ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 w-full"
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
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}
