// src/components/trace/layers/KnnRegionOverlay.tsx
// Canvas-based KNN decision region coloring via k-nearest majority vote.

import { useRef, useEffect } from "react";
import { useThemeStore } from "../../../stores/useThemeStore";

type Point = { x: number; y: number; tone: string };

const RES_X = 80;
const RES_Y = 72;

function resolveToneRgb(tone: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--tn-${tone}`)
    .trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
  return [128, 128, 128];
}

export function KnnRegionOverlay({
  x,
  y,
  width,
  height,
  points,
  k,
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  k: number;
  cellSize: number;
  colOffset: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeStore((s) => s.theme);

  const left = (colOffset + x) * cellSize;
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve unique tones to RGB
    const toneSet = [...new Set(points.map((p) => p.tone))];
    const toneRgb = new Map<string, [number, number, number]>();
    for (const t of toneSet) toneRgb.set(t, resolveToneRgb(t));

    const n = points.length;
    const kClamped = Math.min(k, n);
    const img = ctx.createImageData(RES_X, RES_Y);
    const data = img.data;
    const dists = new Float64Array(n);

    for (let py = 0; py < RES_Y; py++) {
      const gy = y + (py / RES_Y) * height;
      for (let px = 0; px < RES_X; px++) {
        const gx = x + (px / RES_X) * width;

        // Compute distances to all training points
        for (let i = 0; i < n; i++) {
          const dx = gx - points[i].x;
          const dy = gy - points[i].y;
          dists[i] = dx * dx + dy * dy;
        }

        // Find k nearest via partial selection (indices of k smallest)
        const indices = Array.from({ length: n }, (_, i) => i);
        for (let i = 0; i < kClamped; i++) {
          let minJ = i;
          for (let j = i + 1; j < n; j++) {
            if (dists[indices[j]] < dists[indices[minJ]]) minJ = j;
          }
          if (minJ !== i) {
            const tmp = indices[i];
            indices[i] = indices[minJ];
            indices[minJ] = tmp;
          }
        }

        // Majority vote among k nearest
        const votes = new Map<string, number>();
        for (let i = 0; i < kClamped; i++) {
          const tone = points[indices[i]].tone;
          votes.set(tone, (votes.get(tone) ?? 0) + 1);
        }
        let bestTone = points[indices[0]].tone;
        let bestCount = 0;
        for (const [tone, count] of votes) {
          if (count > bestCount) { bestCount = count; bestTone = tone; }
        }

        const rgb = toneRgb.get(bestTone) ?? [128, 128, 128];
        const off = (py * RES_X + px) * 4;
        data[off] = rgb[0];
        data[off + 1] = rgb[1];
        data[off + 2] = rgb[2];
        data[off + 3] = theme === "dark" || theme === "tokyo-night" ? 18 : 30;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [points, k, x, y, width, height, theme]);

  if (points.length === 0) return null;

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
