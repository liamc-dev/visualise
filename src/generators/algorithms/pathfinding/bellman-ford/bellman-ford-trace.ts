// src/generators/algorithms/pathfinding/bellman-ford/bellman-ford-trace.ts
import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TracePointer,
  TraceTone,
  TraceEmphasis,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import { createOpsChart, veProductRef } from "../../../../lib/ops-chart";
import {
  buildGraphFromInput,
  edgeId,
  nodeId,
  type Graph,
  type GraphNode,
} from "./bellman-ford-graph";
import { decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../../../lib/graph-utils";

const BOUNDS = { minX: 0, minY: 0, maxX: 12, maxY: 16 };
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

/* Distance table layout constants */
const DIST_Y = 12;
const DIST_LABEL_Y = 11.65;
const PREV_Y = 14;
const PREV_LABEL_Y = 13.65;
const DIST_X_POSITIONS = [1, 3, 5, 7, 9, 11];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
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
      // Try both perpendicular sides, pick the one further from blocking node
      const a = { x: mx + px * 3, y: my + py * 3 };
      const b = { x: mx - px * 3, y: my - py * 3 };
      const dA = Math.hypot(a.x - n.x, a.y - n.y);
      const dB = Math.hypot(b.x - n.x, b.y - n.y);
      if (dA > dB + 0.01) return a;
      if (dB > dA + 0.01) return b;
      return a.y < b.y ? a : b; // tiebreaker: prefer upward
    }
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Trace generator                                                   */
/* ------------------------------------------------------------------ */

export function bellmanFordTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length === 16 ? input : DEFAULT_DIJKSTRA_INPUT;
  const decoded = decodeGraphInput(encoded);
  const graph = buildGraphFromInput(decoded.source, decoded.edges);

  const labels = graph.nodes.map((n) => n.label);
  const V = labels.length;

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};

  for (const l of labels) {
    dist[l] = Infinity;
    prev[l] = null;
  }
  dist[graph.source] = 0;

  // Track which edges are in the shortest-path tree
  const sptEdges = new Set<string>();

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  // Precompute curve points for edges that pass through non-endpoint nodes
  const curveVias = new Map<string, { x: number; y: number }>();
  for (const ge of graph.edges) {
    const cv = curveViaForEdge(posOf(graph, ge.from), posOf(graph, ge.to), graph.nodes);
    if (cv) curveVias.set(edgeId(ge.from, ge.to), cv);
  }

  // Build directed edge list from undirected graph (both directions)
  const directedEdges: { from: string; to: string; weight: number }[] = [];
  for (const e of graph.edges) {
    directedEdges.push({ from: e.from, to: e.to, weight: e.weight });
    directedEdges.push({ from: e.to, to: e.from, weight: e.weight });
  }

  const opsChart = createOpsChart(veProductRef(V, directedEdges.length));

  /* ---- scene builder ---- */

  function buildScene(opts?: {
    highlightEdge?: string;
    highlightEdgeColor?: string;
    distToneOverrides?: Record<string, TraceTone>;
    distWeightOverrides?: Record<string, 0 | 1 | 2 | 3>;
    prevToneOverrides?: Record<string, TraceTone>;
  }): TraceScene {
    const nodes: TraceNode[] = graph.nodes.map((gn) => {
      const d = dist[gn.label];
      const isSource = gn.label === graph.source;

      let tone: TraceTone;
      let emphasis: TraceEmphasis | undefined;

      if (isSource && d === 0) {
        tone = "accent";
        emphasis = undefined;
      } else if (d < Infinity) {
        tone = "info";
        emphasis = undefined;
      } else {
        tone = "muted";
        emphasis = undefined;
      }

      return {
        id: nodeId(gn.label),
        kind: "cell",
        pos: { x: gn.x, y: gn.y },
        meta: {
          value: d === Infinity ? "\u221e" : d,
          tone,
          emphasis,
          ...(tone === "muted" ? { opacityMul: 0.5 } : undefined),
          label: gn.label,
        },
      };
    });

    const edges: TraceEdge[] = graph.edges.map((ge) => {
      const fromPos = posOf(graph, ge.from);
      const toPos = posOf(graph, ge.to);
      const eid = edgeId(ge.from, ge.to);
      const inSpt = sptEdges.has(eid);
      const isHighlight = opts?.highlightEdge === eid;
      const cv = curveVias.get(eid);

      return {
        id: eid,
        from: nodeId(ge.from),
        to: nodeId(ge.to),
        kind: "graph",
        meta: {
          arrow: inSpt,
          fromPt: edgeEndpoint(fromPos, toPos),
          toPt: edgeEndpoint(toPos, fromPos),
          ...(cv ? { curveVia: cv } : undefined),
          color: isHighlight
            ? (opts?.highlightEdgeColor ?? "rgb(var(--tn-warning) / 0.80)")
            : inSpt
              ? "rgb(var(--tn-accent) / 0.70)"
              : "rgb(var(--tn-accent) / 0.35)",
          opacity: isHighlight ? 0.8 : inSpt ? 0.7 : 0.25,
        },
      };
    });

    // Node label captions (above each node)
    const labelOverlays: TraceOverlay[] = graph.nodes.map((gn) => ({
      kind: "caption" as const,
      id: `bf:label:${gn.label}`,
      x: gn.x,
      y: gn.y - 0.8,
      text: gn.label,
    }));

    // Edge weight captions (at midpoint of each edge, or curve peak)
    const weightOverlays: TraceOverlay[] = graph.edges.map((ge) => {
      const f = posOf(graph, ge.from);
      const t = posOf(graph, ge.to);
      const eid = edgeId(ge.from, ge.to);
      const cv = curveVias.get(eid);

      // Use quadratic bezier midpoint when curved, straight midpoint otherwise
      const mx = cv ? 0.25 * f.x + 0.5 * cv.x + 0.25 * t.x : (f.x + t.x) / 2;
      const my = cv ? 0.25 * f.y + 0.5 * cv.y + 0.25 * t.y : (f.y + t.y) / 2;

      const dx = t.x - f.x;
      const dy = t.y - f.y;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (-dy / len) * 0.45;
      const oy = (dx / len) * 0.45;

      return {
        kind: "caption" as const,
        id: `bf:w:${ge.from}-${ge.to}`,
        x: mx + ox,
        y: my + oy,
        text: String(ge.weight),
      };
    });

    // --- Distance table visualization ---
    const distCaption: TraceOverlay = {
      kind: "caption" as const,
      id: "bf:dist-label",
      x: -1,
      y: DIST_Y,
      text: "dist[]",
      emphasis: "soft",
    };

    const distLabelOverlays: TraceOverlay[] = labels.map((l, i) => ({
      kind: "caption" as const,
      id: `bf:dlbl:${l}`,
      x: DIST_X_POSITIONS[i],
      y: DIST_LABEL_Y,
      text: l,
    }));

    const distNodes: TraceNode[] = labels.map((l, i) => {
      const d = dist[l];
      const isReachable = d < Infinity;
      const toneOverride = opts?.distToneOverrides?.[l];
      const weightOverride = opts?.distWeightOverrides?.[l];

      let tone: TraceTone;
      let emphasis: TraceEmphasis | undefined;

      if (toneOverride) {
        tone = toneOverride;
        emphasis = undefined;
      } else if (isReachable) {
        tone = "info";
        emphasis = undefined;
      } else {
        tone = "muted";
        emphasis = undefined;
      }

      return {
        id: `bf:d:${l}`,
        kind: "cell",
        pos: { x: DIST_X_POSITIONS[i], y: DIST_Y },
        meta: {
          value: d === Infinity ? "\u221e" : d,
          tone,
          emphasis,
          ...(tone === "muted" ? { opacityMul: 0.5 } : undefined),
          ...(weightOverride != null ? { weight: weightOverride } : undefined),
        },
      };
    });

    // --- Predecessor table visualization ---
    const prevCaption: TraceOverlay = {
      kind: "caption" as const,
      id: "bf:prev-label",
      x: -1,
      y: PREV_Y,
      text: "prev[]",
      emphasis: "soft",
    };

    const prevLabelOverlays: TraceOverlay[] = labels.map((l, i) => ({
      kind: "caption" as const,
      id: `bf:plbl:${l}`,
      x: DIST_X_POSITIONS[i],
      y: PREV_LABEL_Y,
      text: l,
    }));

    const prevNodes: TraceNode[] = labels.map((l, i) => {
      const p = prev[l];
      const hasPrev = p !== null;
      const prevTone = opts?.prevToneOverrides?.[l];

      return {
        id: `bf:p:${l}`,
        kind: "cell",
        pos: { x: DIST_X_POSITIONS[i], y: PREV_Y },
        meta: {
          value: hasPrev ? p : "\u2013",
          tone: prevTone ?? (hasPrev ? "info" : "muted") as TraceTone,
          ...(hasPrev ? undefined : { opacityMul: 0.5 }),
        },
      };
    });

    const overlays: TraceOverlay[] = [
      ...labelOverlays, ...weightOverlays,
      distCaption, ...distLabelOverlays,
      prevCaption, ...prevLabelOverlays,
    ];
    const chart = opsChart.overlay();
    if (chart) overlays.push(chart);

    return {
      nodes: [...nodes, ...distNodes, ...prevNodes],
      edges,
      overlays,
      bounds: BOUNDS,
    };
  }

  /* ---- frame pusher ---- */

  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    focusNodes?: string[];
    focusEdges?: string[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
    highlightEdge?: string;
    highlightEdgeColor?: string;
    distToneOverrides?: Record<string, TraceTone>;
    distWeightOverrides?: Record<string, 0 | 1 | 2 | 3>;
    prevToneOverrides?: Record<string, TraceTone>;
  }) {
    const scene = buildScene({
      highlightEdge: args.highlightEdge,
      highlightEdgeColor: args.highlightEdgeColor,
      distToneOverrides: args.distToneOverrides,
      distWeightOverrides: args.distWeightOverrides,
      prevToneOverrides: args.prevToneOverrides,
    });

    applyPointerMasking(scene.nodes, args.pointers);

    frames.push({
      id: `bf.${args.kind}.${stepNo++}`,
      kind: args.kind,
      codeToken: args.codeToken,
      narrationToken: args.narrationToken,
      scene,
      focus: {
        nodes: args.focusNodes?.length ? args.focusNodes : undefined,
        edges: args.focusEdges?.length ? args.focusEdges : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  }

  /* ---- pointer helpers ---- */

  function uPointer(label: string): TracePointer {
    return {
      id: "u",
      label: "u",
      target: { kind: "node", nodeId: nodeId(label) },
      lane: "above",
      color: "var(--color-tn-warning)",
    };
  }

  function vPointer(label: string): TracePointer {
    return {
      id: "v",
      label: "v",
      target: { kind: "node", nodeId: nodeId(label) },
      lane: "below",
      color: "var(--color-tn-cyan)",
    };
  }

  /* ================================================================ */
  /*  Algorithm                                                       */
  /* ================================================================ */

  // --- bf.init --- Initialize distances
  push({
    kind: "init",
    codeToken: "bf.init",
    narrationToken: "bf.init",
    focusNodes: labels.map((l) => `bf:d:${l}`),
    meta: { source: graph.source, V },
  });

  // --- bf.source --- Set dist[source] = 0
  push({
    kind: "source",
    codeToken: "bf.source",
    narrationToken: "bf.source",
    focusNodes: [nodeId(graph.source), `bf:d:${graph.source}`],
    meta: { source: graph.source },
  });

  // --- V-1 passes ---
  for (let pass = 1; pass < V; pass++) {
    // bf.pass — announce pass
    push({
      kind: "pass",
      codeToken: "bf.pass",
      narrationToken: "bf.pass",
      meta: { pass, total: V - 1 },
    });

    for (const edge of directedEdges) {
      const { from: u, to: v, weight: w } = edge;

      // Skip edges where dist[u] === Infinity (can't relax from unreachable)
      if (dist[u] === Infinity) continue;

      const eid = edgeId(u, v);

      // bf.edge — pick next edge
      push({
        kind: "edge",
        codeToken: "bf.edge",
        narrationToken: "bf.edge",
        focusNodes: [nodeId(u), nodeId(v)],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        highlightEdge: eid,
        meta: { u, v, w },
      });

      const tentative = dist[u] + w;

      // bf.relax — compute tentative and compare
      opsChart.record();
      push({
        kind: "relax",
        codeToken: "bf.relax",
        narrationToken: "bf.relax",
        focusNodes: [nodeId(u), nodeId(v), `bf:d:${u}`, `bf:d:${v}`],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        highlightEdge: eid,
        meta: { u, v, w, uDist: dist[u], tentative, currentDist: dist[v] },
      });

      if (tentative < dist[v]) {
        const oldDist = dist[v];
        dist[v] = tentative;
        prev[v] = u;

        // Update SPT: remove old edge to v, add new one
        for (const oe of graph.edges) {
          if (oe.from === v || oe.to === v) {
            sptEdges.delete(edgeId(oe.from, oe.to));
          }
        }
        sptEdges.add(eid);

        // bf.update — distance improved
        push({
          kind: "update",
          codeToken: "bf.update",
          narrationToken: "bf.update",
          focusNodes: [nodeId(v), `bf:d:${v}`, `bf:p:${v}`],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          highlightEdge: eid,
          distToneOverrides: { [v]: "accent" },
          distWeightOverrides: { [v]: 1 },
          prevToneOverrides: { [v]: "accent" },
          meta: {
            u,
            v,
            w,
            oldDist: oldDist === Infinity ? "\u221e" : oldDist,
            newDist: tentative,
          },
        });
      } else {
        // bf.skip — no improvement
        push({
          kind: "skip",
          codeToken: "bf.relax",
          narrationToken: "bf.skip",
          focusNodes: [nodeId(u), nodeId(v), `bf:d:${v}`],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          highlightEdge: eid,
          meta: { u, v, currentDist: dist[v], tentative },
        });
      }
    }
  }

  // --- bf.done --- Final result
  const allDistIds = labels.map((l) => `bf:d:${l}`);
  const allPrevIds = labels.map((l) => `bf:p:${l}`);
  push({
    kind: "done",
    codeToken: "bf.done",
    narrationToken: "bf.done",
    focusNodes: [...labels.map(nodeId), ...allDistIds, ...allPrevIds],
    focusEdges: Array.from(sptEdges),
    meta: { dist: { ...dist }, prev: { ...prev } },
  });

  return frames;
}
