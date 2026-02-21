// src/hooks/trace-height.ts
import type { TraceFrame } from "../types/trace-types";

/**
 * Compute the number of grid rows needed to contain all content across every
 * frame. Returns the max Y coordinate found + 1 (so row 0 counts as 1 row).
 */
export function computeContentHeightRows(frames: TraceFrame[]): number {
  let maxY = 0;

  for (const f of frames) {
    const s = f.scene;

    for (const n of s.nodes) {
      const y = n.pos?.y;
      if (typeof y === "number" && y > maxY) maxY = y;
    }

    if (s.overlays) {
      for (const o of s.overlays) {
        if (o.kind === "band") {
          const bottom = o.y + o.height;
          if (bottom > maxY) maxY = bottom;
        } else if ("y" in o) {
          const y = (o as { y: number }).y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  // +1 because coordinates are 0-indexed
  return maxY + 1;
}
