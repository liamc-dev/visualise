// src/components/trace/layers/TracePointerLayer.tsx
import React from "react";
import { Pointer } from "../shared/Pointer";
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

        let x: number;
        let y: number;

        switch (lane) {
          case "below":
            x = anchorPt.x;
            y = anchorPt.y + triOffset;
            break;
          case "left":
            x = anchorPt.x - triOffset;
            y = anchorPt.y;
            break;
          case "right":
            x = anchorPt.x + triOffset;
            y = anchorPt.y;
            break;
          case "on":
            x = anchorPt.x;
            y = anchorPt.y - textHeight / 2;
            break;
          default: // "above"
            x = anchorPt.x;
            y = anchorPt.y - (textHeight + triOffset + triHeight);
            break;
        }

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
