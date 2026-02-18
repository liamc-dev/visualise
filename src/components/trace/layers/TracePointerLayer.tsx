// src/components/trace/layers/TracePointerLayer.tsx
import React from "react";
import { Pointer } from "../../visualizers/shared/Pointer";
import type { TracePointer } from "../../../types/trace-types";
import { resolveTargetPx } from "../utils/resolve-target-px";

export default function TracePointerLayer({
  pointers,
  nodePx,
  cellSize,
  colOffset,
}: {
  pointers: TracePointer[];
  nodePx: Map<string, { x: number; y: number }>;
  cellSize: number;
  colOffset: number;
}) {
  return (
    <>
      {pointers.map((p) => {
        const lane = p.lane ?? "above";

        const anchorPt = resolveTargetPx({
          target: p.target,
          lane,
          nodePx,
          cellSize,
          colOffset,
        });

        if (!anchorPt) return null;

        const fontSize = Math.max(10, Math.min(16, Math.round(cellSize * 0.34)));
        const textHeight = fontSize;
        const triHeight = cellSize * 0.32;
        const triOffset = cellSize * 0.12;

        const x = anchorPt.x;

        const y =
          lane === "below"
            ? anchorPt.y + triOffset
            : lane === "on"
              ? anchorPt.y - textHeight / 2
              : anchorPt.y - (textHeight + triOffset + triHeight);

        return (
          <Pointer
            key={p.id}
            x={x}
            y={y}
            label={p.label ?? p.id}
            color={p.color ?? "var(--color-tn-cyan)"}
            cellSize={cellSize}
            lane={lane}
          />
        );
      })}
    </>
  );
}
