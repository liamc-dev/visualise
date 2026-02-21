// src/components/trace/utils/resolve-target-px.ts
import type { TracePointerTarget } from "../../../types/trace-types";

export function resolveTargetPx(args: {
  target: TracePointerTarget;
  lane: "above" | "on" | "below" | "left" | "right";
  nodePx: Map<string, { x: number; y: number }>;
  cellSize: number;
  colOffset: number;
}) {
  const { target, lane, nodePx, cellSize, colOffset } = args;

  const defaultAnchor = (): string => {
    switch (lane) {
      case "below": return "bottom";
      case "above": return "top";
      case "left": return "left";
      case "right": return "right";
      default: return "center";
    }
  };

  const anchor = target.anchor ?? defaultAnchor();

  const applyAnchor = (baseX: number, baseY: number) => {
    let x = baseX;
    let y = baseY;

    if (anchor === "point") return { x, y };

    if (anchor === "center") {
      x += cellSize / 2;
      y += cellSize / 2;
    } else if (anchor === "top") {
      x += cellSize / 2;
      y += 0;
    } else if (anchor === "bottom") {
      x += cellSize / 2;
      y += cellSize;
    } else if (anchor === "left") {
      x += 0;
      y += cellSize / 2;
    } else if (anchor === "right") {
      x += cellSize;
      y += cellSize / 2;
    }

    return { x, y };
  };

  if (target.kind === "node") {
    const n = nodePx.get(target.nodeId);
    if (!n) return null;
    return applyAnchor(n.x, n.y);
  }

  const pxX = (colOffset + target.x) * cellSize;
  const pxY = target.y * cellSize;
  return applyAnchor(pxX, pxY);
}
