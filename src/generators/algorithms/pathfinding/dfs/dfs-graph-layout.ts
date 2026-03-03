// src/generators/algorithms/pathfinding/dfs/dfs-graph-layout.ts
// Scene builder + geometry helpers for DFS graph visualization.

import type {
  TraceScene,
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceTone,
  TraceEmphasis,
} from "../../../../types/trace-types";
import {
  edgeId,
  nodeId,
  type Graph,
  type GraphNode,
} from "./dfs-graph";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

export const BOUNDS = { minX: 0, minY: 0, maxX: 12, maxY: 14 };
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

/* Stack visualization layout (below the graph) */
const STACK_Y = 12;
const CUR_NODE_X = 1.5;
const STACK_LABEL_X = 3;
const STACK_START_X = 4;
const STACK_SPACING = 1.2;
export const STACK_MAX_VISIBLE = 6;

/* ------------------------------------------------------------------ */
/*  State passed from trace → layout                                  */
/* ------------------------------------------------------------------ */

export type DfsGraphState = {
  graph: Graph;
  order: Record<string, number>;
  visited: Set<string>;
  stack: string[];
  curNode: string | null;
  showResult: boolean;
  treeEdges: Set<string>;
  curveVias: Map<string, { x: number; y: number }>;
};

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                  */
/* ------------------------------------------------------------------ */

function edgeEndpoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const offset = NODE_RADIUS + EDGE_GAP;
  const rr = Math.min(offset, Math.max(0, len / 2 - 0.01));
  return { x: from.x + (dx / len) * rr, y: from.y + (dy / len) * rr };
}

function posOf(graph: Graph, label: string): GraphNode {
  return graph.nodes.find((n) => n.label === label)!;
}

/** If a straight edge passes through a non-endpoint node, return a quadratic
 *  bezier control point that arcs the edge around it. */
function curveViaForEdge(
  from: GraphNode,
  to: GraphNode,
  allNodes: GraphNode[],
): { x: number; y: number } | undefined {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return undefined;
  const len = Math.sqrt(lenSq);

  for (const n of allNodes) {
    if (n.label === from.label || n.label === to.label) continue;
    const t = ((n.x - from.x) * dx + (n.y - from.y) * dy) / lenSq;
    if (t < 0.1 || t > 0.9) continue;
    const projX = from.x + t * dx;
    const projY = from.y + t * dy;
    if (Math.hypot(n.x - projX, n.y - projY) < 1.5) {
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const px = -dy / len;
      const py = dx / len;
      const a = { x: mx + px * 3, y: my + py * 3 };
      const b = { x: mx - px * 3, y: my - py * 3 };
      const dA = Math.hypot(a.x - n.x, a.y - n.y);
      const dB = Math.hypot(b.x - n.x, b.y - n.y);
      if (dA > dB + 0.01) return a;
      if (dB > dA + 0.01) return b;
      return a.y < b.y ? a : b;
    }
  }
  return undefined;
}

export function stackNodeId(i: number): string {
  return `dfs:s:${i}`;
}

/* ------------------------------------------------------------------ */
/*  Precompute curve vias                                             */
/* ------------------------------------------------------------------ */

export function computeCurveVias(
  graph: Graph,
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const ge of graph.edges) {
    const cv = curveViaForEdge(
      posOf(graph, ge.from), posOf(graph, ge.to), graph.nodes,
    );
    if (cv) map.set(edgeId(ge.from, ge.to), cv);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Scene builder                                                     */
/* ------------------------------------------------------------------ */

export function buildScene(st: DfsGraphState): TraceScene {
  const { graph, order, visited, stack, curNode, showResult, treeEdges, curveVias } = st;

  // --- Graph nodes ---
  const nodes: TraceNode[] = graph.nodes.map((gn) => {
    const isVisited = visited.has(gn.label);
    const isSource = gn.label === graph.source;
    const isCur = curNode === gn.label;
    const ord = order[gn.label];
    const hasOrder = ord !== undefined;

    let tone: TraceTone;
    let emphasis: TraceEmphasis | undefined;

    if (showResult && isSource) {
      tone = "warning";
    } else if (showResult && isVisited) {
      tone = "accent";
    } else if (isCur) {
      tone = "warning";
    } else if (isVisited) {
      tone = "neutral";
      emphasis = "soft";
    } else if (hasOrder) {
      tone = "info";
    } else if (isSource && !hasOrder) {
      tone = "accent";
    } else {
      tone = "muted";
    }

    return {
      id: nodeId(gn.label),
      kind: "cell",
      pos: { x: gn.x, y: gn.y },
      meta: {
        value: hasOrder ? ord : "\u2014",
        tone,
        emphasis,
        ...(tone === "muted" ? { opacityMul: 0.5 } : undefined),
        label: gn.label,
      },
    };
  });

  // --- Graph edges ---
  const edges: TraceEdge[] = graph.edges.map((ge) => {
    const fromPos = posOf(graph, ge.from);
    const toPos = posOf(graph, ge.to);
    const eid = edgeId(ge.from, ge.to);
    const inTree = treeEdges.has(eid);
    const cv = curveVias.get(eid);

    return {
      id: eid,
      from: nodeId(ge.from),
      to: nodeId(ge.to),
      kind: "graph",
      meta: {
        arrow: inTree,
        fromPt: edgeEndpoint(fromPos, toPos),
        toPt: edgeEndpoint(toPos, fromPos),
        ...(cv ? { curveVia: cv } : undefined),
        color: inTree
          ? "rgb(var(--tn-accent) / 0.70)"
          : "rgb(var(--tn-accent) / 0.35)",
        opacity: inTree ? 0.7 : 0.25,
      },
    };
  });

  // --- Node label captions ---
  const labelOverlays: TraceOverlay[] = graph.nodes.map((gn) => ({
    kind: "caption" as const,
    id: `dfs:label:${gn.label}`,
    x: gn.x,
    y: gn.y - 0.8,
    text: gn.label,
  }));

  // --- Cur node (popped node shown left of stack) ---
  if (curNode) {
    nodes.push({
      id: "dfs:cur",
      kind: "cell",
      pos: { x: CUR_NODE_X, y: STACK_Y },
      meta: {
        value: curNode,
        tone: "warning" as TraceTone,
      },
    });
  }

  // --- Stack nodes (top of stack leftmost) ---
  const topSlice = stack.slice(-STACK_MAX_VISIBLE).reverse();
  for (let i = 0; i < topSlice.length; i++) {
    nodes.push({
      id: stackNodeId(i),
      kind: "cell",
      pos: { x: STACK_START_X + i * STACK_SPACING, y: STACK_Y },
      meta: {
        value: topSlice[i],
        tone: "info" as TraceTone,
      },
    });
  }

  // --- Stack captions ---
  const stackOverlays: TraceOverlay[] = [];

  if (curNode) {
    stackOverlays.push({
      kind: "caption" as const,
      id: "dfs:cur-label",
      x: 0.5,
      y: STACK_Y,
      text: "cur",
      emphasis: "soft" as const,
    });
  }

  stackOverlays.push({
    kind: "caption" as const,
    id: "dfs:stack-label",
    x: STACK_LABEL_X,
    y: STACK_Y,
    text: "Stack",
    emphasis: "soft" as const,
  });

  if (stack.length > STACK_MAX_VISIBLE) {
    stackOverlays.push({
      kind: "caption" as const,
      id: "dfs:stack-overflow",
      x: STACK_START_X + STACK_MAX_VISIBLE * STACK_SPACING,
      y: STACK_Y,
      text: `+${stack.length - STACK_MAX_VISIBLE}`,
      emphasis: "soft" as const,
    });
  }

  return {
    nodes,
    edges,
    overlays: [...labelOverlays, ...stackOverlays],
    bounds: BOUNDS,
  };
}
