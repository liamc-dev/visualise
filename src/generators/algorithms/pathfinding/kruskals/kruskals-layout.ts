// src/generators/algorithms/pathfinding/kruskals/kruskals-layout.ts
// Scene builder + geometry helpers for Kruskal's MST visualization.

import type {
  TraceScene,
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceTone,
} from "../../../../types/trace-types";
import {
  edgeId,
  nodeId,
  type Graph,
  type GraphNode,
} from "./kruskals-graph";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

export const BOUNDS = { minX: 0, minY: 0, maxX: 12, maxY: 16 };
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

const PARENT_Y = 12;
const PARENT_LABEL_Y = 11.65;
const EDGE_ROW_Y = 14;
const EDGE_ROW_LABEL_Y = 13.65;
const TABLE_X_POSITIONS = [1, 3, 5, 7, 9, 11];

/* ------------------------------------------------------------------ */
/*  State passed from trace → layout                                  */
/* ------------------------------------------------------------------ */

export type SortedEdge = { from: string; to: string; weight: number };

export type KruskalsState = {
  graph: Graph;
  labels: string[];
  parent: Record<string, string>;
  mstEdges: Set<string>;
  sortedEdges: SortedEdge[];
  edgeStatuses: ("pending" | "accepted" | "skipped")[];
  edgeIndex: number;
  curveVias: Map<string, { x: number; y: number }>;
};

export type BuildSceneOpts = {
  highlightEdge?: string;
  highlightEdgeColor?: string;
  nodeToneOverrides?: Record<string, TraceTone>;
  parentToneOverrides?: Record<string, TraceTone>;
};

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                   */
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

export function buildScene(
  st: KruskalsState,
  opts?: BuildSceneOpts,
): TraceScene {
  const { graph, labels, parent, mstEdges, sortedEdges, edgeStatuses, curveVias } = st;

  // --- Graph nodes ---
  const nodes: TraceNode[] = graph.nodes.map((gn) => {
    const connected = Array.from(mstEdges).some((eid) => {
      const parts = eid.replace("kr:e:", "").split("-");
      return parts[0] === gn.label || parts[1] === gn.label;
    });
    const nOvr = opts?.nodeToneOverrides?.[gn.label];
    const tone: TraceTone = nOvr ?? (connected ? "accent" : "muted");

    return {
      id: nodeId(gn.label),
      kind: "cell",
      pos: { x: gn.x, y: gn.y },
      meta: {
        value: gn.label,
        tone,
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
    const inTree = mstEdges.has(eid);
    const isHighlight = opts?.highlightEdge === eid;
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
        color: isHighlight
          ? (opts?.highlightEdgeColor ?? "rgb(var(--tn-warning) / 0.80)")
          : inTree
            ? "rgb(var(--tn-accent) / 0.70)"
            : "rgb(var(--tn-accent) / 0.35)",
        opacity: isHighlight ? 0.8 : inTree ? 0.7 : 0.25,
      },
    };
  });

  // --- Overlays: node labels + edge weights ---
  const labelOverlays: TraceOverlay[] = graph.nodes.map((gn) => ({
    kind: "caption" as const,
    id: `kr:label:${gn.label}`,
    x: gn.x,
    y: gn.y - 0.8,
    text: gn.label,
  }));

  const weightOverlays: TraceOverlay[] = graph.edges.map((ge) => {
    const f = posOf(graph, ge.from);
    const t = posOf(graph, ge.to);
    const eid = edgeId(ge.from, ge.to);
    const cv = curveVias.get(eid);

    const mx = cv ? 0.25 * f.x + 0.5 * cv.x + 0.25 * t.x : (f.x + t.x) / 2;
    const my = cv ? 0.25 * f.y + 0.5 * cv.y + 0.25 * t.y : (f.y + t.y) / 2;
    const dx = t.x - f.x;
    const dy = t.y - f.y;
    const len = Math.hypot(dx, dy) || 1;

    return {
      kind: "caption" as const,
      id: `kr:w:${ge.from}-${ge.to}`,
      x: mx + (-dy / len) * 0.45,
      y: my + (dx / len) * 0.45,
      text: String(ge.weight),
    };
  });

  // --- Parent table (DSU) ---
  const parentCaption: TraceOverlay = {
    kind: "caption", id: "kr:parent-label",
    x: -1, y: PARENT_Y, text: "parent[]", emphasis: "soft",
  };
  const parentLabelOverlays: TraceOverlay[] = labels.map((l, i) => ({
    kind: "caption" as const, id: `kr:plbl:${l}`,
    x: TABLE_X_POSITIONS[i], y: PARENT_LABEL_Y, text: l,
  }));
  const parentNodes: TraceNode[] = labels.map((l, i) => {
    const p = parent[l];
    const pTone = opts?.parentToneOverrides?.[l];
    return {
      id: `kr:p:${l}`, kind: "cell",
      pos: { x: TABLE_X_POSITIONS[i], y: PARENT_Y },
      meta: {
        value: p,
        tone: pTone ?? "info" as TraceTone,
      },
    };
  });

  // --- Sorted edge row ---
  const edgeRowCaption: TraceOverlay = {
    kind: "caption", id: "kr:edges-label",
    x: -1, y: EDGE_ROW_Y, text: "edges[]", emphasis: "soft",
  };
  const edgeLabelOverlays: TraceOverlay[] = sortedEdges.map((se, i) => ({
    kind: "caption" as const, id: `kr:elbl:${i}`,
    x: 1 + i, y: EDGE_ROW_LABEL_Y, text: `${se.from}-${se.to}`,
  }));
  const edgeRowNodes: TraceNode[] = sortedEdges.map((se, i) => {
    const status = edgeStatuses[i];
    const tone: TraceTone = status === "accepted"
      ? "accent"
      : status === "skipped"
        ? "muted"
        : "info";
    return {
      id: `kr:se:${i}`, kind: "cell",
      pos: { x: 1 + i, y: EDGE_ROW_Y },
      meta: {
        value: se.weight,
        tone,
        ...(status === "skipped" ? { opacityMul: 0.5 } : undefined),
      },
    };
  });

  return {
    nodes: [...nodes, ...parentNodes, ...edgeRowNodes],
    edges,
    overlays: [
      ...labelOverlays, ...weightOverlays,
      parentCaption, ...parentLabelOverlays,
      edgeRowCaption, ...edgeLabelOverlays,
    ],
    bounds: BOUNDS,
  };
}
