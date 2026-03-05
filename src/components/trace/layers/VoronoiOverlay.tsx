// src/components/trace/layers/VoronoiOverlay.tsx
// Canvas-based Voronoi region coloring for K-Means cluster visualization.

import { useRef, useEffect } from "react";

type Centroid = { x: number; y: number; tone: string };

/** Resolution of the offscreen canvas (stretched to fill plot area). */
const RES_X = 80;
const RES_Y = 72;

/**
 * Parse a CSS var color string like "rgb(var(--tn-cyan))" won't work on canvas.
 * Instead we read the computed CSS variable value from the document root.
 */
function resolveToneRgb(tone: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--tn-${tone}`)
    .trim();
  // raw is like "100 200 255"
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
  return [128, 128, 128];
}

export function VoronoiOverlay({
  x,
  y,
  width,
  height,
  centroids,
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  centroids: Centroid[];
  cellSize: number;
  colOffset: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const left = (colOffset + x) * cellSize;
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || centroids.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = centroids.map((c) => resolveToneRgb(c.tone));
    const img = ctx.createImageData(RES_X, RES_Y);
    const data = img.data;

    for (let py = 0; py < RES_Y; py++) {
      // Map pixel y to grid y coordinate
      const gy = y + (py / RES_Y) * height;
      for (let px = 0; px < RES_X; px++) {
        // Map pixel x to grid x coordinate
        const gx = x + (px / RES_X) * width;

        // Find nearest centroid
        let bestJ = 0;
        let bestD = Infinity;
        for (let j = 0; j < centroids.length; j++) {
          const dx = gx - centroids[j].x;
          const dy = gy - centroids[j].y;
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; bestJ = j; }
        }

        const off = (py * RES_X + px) * 4;
        const [r, g, b] = colors[bestJ];
        data[off] = r;
        data[off + 1] = g;
        data[off + 2] = b;
        data[off + 3] = 15; // very low opacity
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [centroids, x, y, width, height]);

  if (centroids.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={RES_X}
      height={RES_Y}
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        pointerEvents: "none",
        imageRendering: "auto",
      }}
    />
  );
}
