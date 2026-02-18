// src/components/trace/hooks/use-trace-edges.ts
import { useMemo } from "react";
import type { TraceScene } from "../../../types/trace-types";
import type { TreeEdge, TreePoint } from "../../visualizers/shared/TreeOverlay";

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function normalizePoints(v: unknown): Array<{ x: number; y: number }> {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .filter((p) => p && isNum((p as any).x) && isNum((p as any).y))
      .map((p) => ({ x: (p as any).x, y: (p as any).y }));
  }
  if (isNum((v as any).x) && isNum((v as any).y)) {
    return [{ x: (v as any).x, y: (v as any).y }];
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

function isPoint(p: any): p is { x: number; y: number } {
  return p && isNum(p.x) && isNum(p.y);
}

export function useTraceEdges(args: {
  scene: TraceScene;
  cellSize: number;
  focusNodes: Set<string>;
  focusEdges: Set<string>;
  colOffset: number;
}) {
  const { scene, cellSize, focusNodes, focusEdges, colOffset } = args;

  return useMemo(() => {
    const edges = scene.edges ?? [];

    return edges
      .map((e) => {
        const meta = (e.meta as any) ?? {};

        
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
  }, [scene, cellSize, colOffset, focusEdges, focusNodes]);
}
