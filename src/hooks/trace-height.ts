// src/hooks/trace-height.ts
import type { TraceFrame } from "../types/trace-types";

/**
 * Compute the number of grid rows needed to contain all content across every
 * frame. Returns the max Y coordinate found + 1 (so row 0 counts as 1 row).
 */
export function computeContentHeightRows(frames: TraceFrame[]): number {
  let maxY = 0;
  let hasBounds = false;

  for (const f of frames) {
    const s = f.scene;

    // Explicit bounds take priority over scanning content
    if (s.bounds) {
      const by = s.bounds.maxY;
      if (typeof by === "number" && by > maxY) maxY = by;
      hasBounds = true;
      continue;
    }

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

  // When bounds are explicit the maxY already represents the row count
  return hasBounds ? maxY : maxY + 1;
}
