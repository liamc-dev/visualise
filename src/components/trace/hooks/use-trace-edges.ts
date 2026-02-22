// src/components/trace/hooks/use-trace-edges.ts
import { useMemo } from "react";
import type { TraceScene } from "../../../types/trace-types";
import type { TreeEdge, TreePoint } from "../shared/TreeOverlay";

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizePoints(v: unknown): Array<{ x: number; y: number }> {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .filter((p) => { const r = asRecord(p); return r && isNum(r.x) && isNum(r.y); })
      .map((p) => { const r = asRecord(p)!; return { x: r.x as number, y: r.y as number }; });
  }
  const r = asRecord(v);
  if (r && isNum(r.x) && isNum(r.y)) {
    return [{ x: r.x as number, y: r.y as number }];
  }
  return [];
}

function gridToPx(
  p: { x: number; y: number },
  colOffset: number,
  cellSize: number
): TreePoint {
  return {
    x: (colOffset + p.x) * cellSize + cellSize / 2,
    y: p.y * cellSize + cellSize / 2,
  };
}

function isPoint(p: unknown): p is { x: number; y: number } {
  const r = asRecord(p);
  return r !== null && isNum(r.x) && isNum(r.y);
}

export function useTraceEdges(args: {
  scene: TraceScene;
  cellSize: number;
  focusNodes: Set<string>;
  focusEdges: Set<string>;
  colOffset: number;
}) {
  const { scene, cellSize, focusEdges, colOffset } = args;

  return useMemo(() => {
    const edges = scene.edges ?? [];

    return edges
      .map((e) => {
        const meta = (e.meta ?? {}) as Record<string, unknown>;

        
        const fromPtGrid = meta.fromPt;
        const toPtGrid = meta.toPt;

        if (!isPoint(fromPtGrid) || !isPoint(toPtGrid)) {
          return null;
        }

        const active = focusEdges.has(e.id);

        // Style resolution (support either e.kind or meta.style or meta.dashed)
        const style = (e.kind ?? meta.style ?? "flow") as string;
        const dashed = meta.dashed === true || style === "dashed";
        const opacity = active ? 0.6 : 0.28;

        const from = gridToPx(fromPtGrid, colOffset, cellSize);
        const to = gridToPx(toPtGrid, colOffset, cellSize);

        const viaGrid = normalizePoints(meta.via);
        const via = viaGrid.length
          ? viaGrid.map((p) => gridToPx(p, colOffset, cellSize))
          : undefined;

        const cv = meta.curveVia;
        const curveVia = isPoint(cv) ? gridToPx(cv, colOffset, cellSize) : undefined;

        const out: TreeEdge = {
          from,
          to,
          active,
          opacity,
          dashed,
          arrow: meta.arrow ?? true,
          // If curved, ignore polyline routing
          via: curveVia ? undefined : via,
          curveVia,
          color: meta.color,
        };

        return out;
      })
      .filter(Boolean) as TreeEdge[];
  }, [scene, cellSize, colOffset, focusEdges]);
}
