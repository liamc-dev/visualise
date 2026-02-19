// src/components/trace/layers/TraceNodeLayer.tsx
import React from "react";
import { getTraceCellStyle } from "../traceCellStyle";
import TraceCardContent from "../TraceCardContent";
import type { TraceNode } from "../../../types/trace-types";

function isCardNode(n: TraceNode) {
  return n.kind === "card";
}

function asCardClassName(base: string) {
  return base
    .replace("items-center", "items-start")
    .replace("justify-center", "justify-start");
}

export default function TraceNodeLayer({
  nodes,
  nodePx,
  focusNodes,
  cellSize,
  colOffset: _colOffset,
  glow,
}: {
  nodes: TraceNode[];
  nodePx: Map<string, { x: number; y: number }>;
  focusNodes: Set<string>;
  cellSize: number;
  colOffset: number;
  glow: boolean;
}) {
  return (
    <>
      {nodes.map((n: TraceNode) => {
        const px = nodePx.get(n.id);
        if (!px) return null;

        const highlight = focusNodes.has(n.id);

        const { className, style } = getTraceCellStyle({
          cellSize,
          x: px.x,
          y: px.y,
          depth: n.pos.depth ?? 0,
          node: n,
          highlight,
          trail: false,
          write: false,
          glow,
        });

        if (isCardNode(n)) {
          return (
            <div
              key={n.id}
              className={[
                asCardClassName(className),
                "flex-col",
                "text-left",
                "px-3",
                "py-2",
                "gap-1",
                "select-none",
                "overflow-hidden",
              ].join(" ")}
              style={style}
            >
              <TraceCardContent meta={n.meta} />
            </div>
          );
        }

        return (
          <div key={n.id} className={className} style={style}>
            {n.meta?.value ?? ""}
          </div>
        );
      })}
    </>
  );
}
