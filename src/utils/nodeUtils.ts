import type { ActiveNode } from "./types";

export function getNodeMid(node: ActiveNode): number {
    // Use stored mid if present, otherwise derive from [lo, hi]
    return node.mid ?? Math.floor((node.lo + node.hi) / 2);
}

export function getShiftedColumnForNode(
    globalIndex: number,
    node: ActiveNode,
    colOffset: number
): number {

    if (node.mid === undefined) {
        return colOffset + globalIndex;
    }

    const mid = node.mid;
    const base = colOffset + globalIndex;
    const depthOffset = 0;
    const rel = globalIndex - mid;

    
    if (rel <= 0) return base - depthOffset;
    if (rel > 0) return base - depthOffset + 1;
    return base;
}