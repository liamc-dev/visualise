// src/trace/utils/trace-bounds.ts
import type { TraceScene } from "../../../types/trace-types";

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function computeSceneBounds(scene: TraceScene): TraceScene["bounds"] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const includeX = (x: number) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  };

  const includeY = (y: number) => {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  };

  const includePoint = (x: number, y: number) => {
    includeX(x);
    includeY(y);
  };

  const includeRect = (x: number, y: number, w: number, h: number) => {
    includePoint(x, y);
    includePoint(x + w, y + h);
  };

  // ---- nodes (respect card geometry if provided) ---------------------------
  for (const n of scene.nodes ?? []) {
    const x = n.pos.x;
    const y = n.pos.y;

    const wCols = n.meta?.wCols;
    const hRows = n.meta?.hRows;

    if (isNum(wCols) && isNum(hRows) && wCols > 0 && hRows > 0) {
      includeRect(x, y, wCols, hRows);
    } else {
      includeRect(x, y, 1, 1);
    }
  }

  // ---- overlays ------------------------------------------------------------
  for (const overlay of scene.overlays ?? []) {
    if (overlay.kind === "text") {
      includePoint(overlay.x, overlay.y);
      continue;
    }

    if (overlay.kind === "caption") {
      
      includeY(overlay.y);
      continue;
    }

    if (overlay.kind === "vline") {
      includeX(overlay.x);
      includeY(overlay.y1);
      includeY(overlay.y2);
      continue;
    }

    if (overlay.kind === "band") {
      
      includeY(overlay.y);
      includeY(overlay.y + (overlay.height ?? 0));
      continue;
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return { minX, minY, maxX, maxY };
}
