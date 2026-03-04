// src/lib/trace-utils.ts
import type { TraceNode, TracePointer } from "../types/trace-types";

/**
 * Blank the displayed value on cells physically behind pointer badges.
 * A pointer badge extends ~1 cell in its lane direction from the target,
 * overlapping any node at that adjacent position.
 *
 * Mutates `nodes[].meta.value` in place.
 */
export function applyPointerMasking(
  nodes: TraceNode[],
  pointers: TracePointer[] | undefined,
): void {
  if (!pointers?.length) return;

  const posMap = new Map<string, TraceNode>();
  for (const nd of nodes) {
    posMap.set(`${nd.pos.x},${nd.pos.y}`, nd);
  }

  for (const p of pointers) {
    if (p.target.kind !== "node") continue;
    const target = nodes.find((nd) => nd.id === (p.target as { kind: "node"; nodeId: string }).nodeId);
    if (!target) continue;

    const lane = p.lane ?? "above";
    let maskedKey: string | undefined;
    if (lane === "above") maskedKey = `${target.pos.x},${target.pos.y - 1}`;
    else if (lane === "below") maskedKey = `${target.pos.x},${target.pos.y + 1}`;
    else if (lane === "left") maskedKey = `${target.pos.x - 1},${target.pos.y}`;
    else if (lane === "right") maskedKey = `${target.pos.x + 1},${target.pos.y}`;

    if (maskedKey) {
      const masked = posMap.get(maskedKey);
      if (masked?.meta) {
        masked.meta = { ...masked.meta, value: "" };
      }
    }
  }
}
