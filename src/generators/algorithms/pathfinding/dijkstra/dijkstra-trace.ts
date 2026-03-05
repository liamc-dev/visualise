// src/generators/algorithms/pathfinding/dijkstra/dijkstra-trace.ts
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
import { createOpsChart, veRef } from "../../../../lib/ops-chart";
import {
  buildAdj,
  buildGraphFromInput,
  edgeId,
  nodeId,
  type Graph,
  type GraphNode,
} from "./dijkstra-graph";
import { decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../../../lib/graph-utils";
import { dijkstraGridTrace } from "./dijkstra-grid-trace";

const BOUNDS = { minX: 0, minY: 0, maxX: 12, maxY: 14 };
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

/* Distance table layout constants */
const DIST_Y = 12;
const DIST_LABEL_Y = 11.65;
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

export function dijkstraTrace(input: number[]): TraceFrame[] {
  // Grid mode: anything that isn't a 16-element graph encoding
  if (input.length !== 16) {
    return dijkstraGridTrace(input);
  }

  // Decode input or fall back to defaults
  const encoded = input.length === 16 ? input : DEFAULT_DIJKSTRA_INPUT;
  const decoded = decodeGraphInput(encoded);
  const graph = buildGraphFromInput(decoded.source, decoded.edges);
  const adj = buildAdj(graph);

  const labels = graph.nodes.map((n) => n.label);

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const l of labels) {
    dist[l] = Infinity;
    prev[l] = null;
  }
  dist[graph.source] = 0;

  // Track which edges are in the shortest-path tree
  const sptEdges = new Set<string>();

  // Precompute curve points for edges that pass through non-endpoint nodes
  const curveVias = new Map<string, { x: number; y: number }>();
  for (const ge of graph.edges) {
    const cv = curveViaForEdge(posOf(graph, ge.from), posOf(graph, ge.to), graph.nodes);
    if (cv) curveVias.set(edgeId(ge.from, ge.to), cv);
  }

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  const opsChart = createOpsChart(veRef(labels.length, graph.edges.length * 2));

  /* ---- scene builder ---- */

  function buildScene(): TraceScene {
    const nodes: TraceNode[] = graph.nodes.map((gn) => {
      const d = dist[gn.label];
      const isVisited = visited.has(gn.label);
      const isSource = gn.label === graph.source;

      let tone: TraceTone;
      let emphasis: TraceEmphasis | undefined;

      if (isVisited) {
        tone = "neutral";
        emphasis = "soft";
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
          ...(isSource && !isVisited ? { tone: "accent" as const } : undefined),
          label: gn.label,
        },
      };
    });

    const edges: TraceEdge[] = graph.edges.map((ge) => {
      const fromPos = posOf(graph, ge.from);
      const toPos = posOf(graph, ge.to);
      const eid = edgeId(ge.from, ge.to);
      const inSpt = sptEdges.has(eid);
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
          color: inSpt
            ? "rgb(var(--tn-accent) / 0.70)"
            : "rgb(var(--tn-accent) / 0.35)",
          opacity: inSpt ? 0.7 : 0.25,
        },
      };
    });

    // Node label captions (above each node)
    const labelOverlays: TraceOverlay[] = graph.nodes.map((gn) => ({
      kind: "caption" as const,
      id: `dj:label:${gn.label}`,
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

      // Offset weight label slightly so it doesn't sit on the edge line
      const dx = t.x - f.x;
      const dy = t.y - f.y;
      const len = Math.hypot(dx, dy) || 1;
      // Perpendicular offset (rotate 90 degrees left)
      const ox = (-dy / len) * 0.45;
      const oy = (dx / len) * 0.45;

      return {
        kind: "caption" as const,
        id: `dj:w:${ge.from}-${ge.to}`,
        x: mx + ox,
        y: my + oy,
        text: String(ge.weight),
      };
    });

    // --- Distance table visualization ---
    const distCaption: TraceOverlay = {
      kind: "caption" as const,
      id: "dj:dist-label",
      x: -1,
      y: DIST_Y,
      text: "dist[]",
      emphasis: "soft",
    };

    const distLabelOverlays: TraceOverlay[] = labels.map((l, i) => ({
      kind: "caption" as const,
      id: `dj:dlbl:${l}`,
      x: DIST_X_POSITIONS[i],
      y: DIST_LABEL_Y,
      text: l,
    }));

    const distNodes: TraceNode[] = labels.map((l, i) => {
      const d = dist[l];
      const isVisited = visited.has(l);
      const isReachable = d < Infinity;

      let tone: TraceTone;
      let emphasis: TraceEmphasis | undefined;

      if (isVisited) {
        tone = "neutral";
        emphasis = "soft";
      } else if (isReachable) {
        tone = "info";
        emphasis = undefined;
      } else {
        tone = "muted";
        emphasis = undefined;
      }

      return {
        id: `dj:d:${l}`,
        kind: "cell",
        pos: { x: DIST_X_POSITIONS[i], y: DIST_Y },
        meta: {
          value: d === Infinity ? "\u221e" : d,
          tone,
          emphasis,
          ...(tone === "muted" ? { opacityMul: 0.5 } : undefined),
        },
      };
    });

    const overlays: TraceOverlay[] = [...labelOverlays, ...weightOverlays, distCaption, ...distLabelOverlays];
    const chart = opsChart.overlay();
    if (chart) overlays.push(chart);

    return {
      nodes: [...nodes, ...distNodes],
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
  }) {
    const scene = buildScene();

    applyPointerMasking(scene.nodes, args.pointers);

    frames.push({
      id: `dj.${args.kind}.${stepNo++}`,
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

  // --- Init phase (4 frames) ---

  // dj.init.dist — Initialize distances to ∞
  push({
    kind: "init.dist",
    codeToken: "dj.init.dist",
    narrationToken: "dj.init.dist",
    focusNodes: labels.map((l) => `dj:d:${l}`),
    meta: { source: graph.source },
  });

  // dj.init.prev — Initialize prev to null
  push({
    kind: "init.prev",
    codeToken: "dj.init.prev",
    narrationToken: "dj.init.prev",
  });

  // dj.init.visited — Create empty visited set
  push({
    kind: "init.visited",
    codeToken: "dj.init.visited",
    narrationToken: "dj.init.visited",
  });

  // dj.init.setdist — Set dist[source] = 0
  push({
    kind: "init.setdist",
    codeToken: "dj.init.setdist",
    narrationToken: "dj.init.setdist",
    focusNodes: [nodeId(graph.source), `dj:d:${graph.source}`],
    meta: { source: graph.source },
  });

  // --- main loop ---
  while (visited.size < labels.length) {
    // Pick unvisited node with minimum distance
    let u: string | null = null;
    let minDist = Infinity;
    for (const l of labels) {
      if (!visited.has(l) && dist[l] < minDist) {
        minDist = dist[l];
        u = l;
      }
    }
    if (u === null) break; // unreachable nodes

    const unvisitedCount = labels.length - visited.size;

    // --- dj.loop ---
    push({
      kind: "loop",
      codeToken: "dj.loop",
      narrationToken: "dj.loop",
      pointers: [uPointer(u)],
      meta: { unvisitedCount },
    });

    // --- dj.pick ---
    push({
      kind: "pick",
      codeToken: "dj.pick",
      narrationToken: "dj.pick",
      focusNodes: [nodeId(u), `dj:d:${u}`],
      pointers: [uPointer(u)],
      meta: { u, dist: dist[u] },
    });

    // Relax neighbors
    const neighbors = adj.get(u)!;
    for (const { to: v, weight: w } of neighbors) {
      const eid = edgeId(u, v);

      // --- dj.neighbors --- Consider this neighbor
      push({
        kind: "neighbors",
        codeToken: "dj.neighbors",
        narrationToken: "dj.neighbors",
        focusNodes: [nodeId(u), nodeId(v)],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v, w },
      });

      // --- dj.check.visited --- Check if v already visited
      const isVisited = visited.has(v);
      push({
        kind: "check.visited",
        codeToken: "dj.check.visited",
        narrationToken: "dj.check.visited",
        focusNodes: [nodeId(u), nodeId(v), `dj:d:${v}`],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v, w, result: isVisited ? "fail" : "pass" },
      });
      if (isVisited) continue;

      const tentative = dist[u] + w;

      // --- dj.relax --- Compute tentative and compare
      opsChart.record();
      push({
        kind: "relax",
        codeToken: "dj.relax",
        narrationToken: "dj.relax",
        focusNodes: [nodeId(u), nodeId(v), `dj:d:${v}`],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
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

        // --- dj.update ---
        push({
          kind: "update",
          codeToken: "dj.update",
          narrationToken: "dj.update",
          focusNodes: [nodeId(v), `dj:d:${v}`],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          meta: {
            u,
            v,
            w,
            oldDist: oldDist === Infinity ? "\u221e" : oldDist,
            newDist: tentative,
          },
        });
      } else {
        // --- dj.skip ---
        push({
          kind: "skip",
          codeToken: "dj.relax",
          narrationToken: "dj.skip",
          focusNodes: [nodeId(u), nodeId(v), `dj:d:${v}`],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          meta: { u, v, currentDist: dist[v], tentative },
        });
      }
    }

    // --- dj.visit ---
    visited.add(u);
    push({
      kind: "visit",
      codeToken: "dj.visit",
      narrationToken: "dj.visit",
      focusNodes: [nodeId(u), `dj:d:${u}`],
      pointers: [uPointer(u)],
      meta: { u, dist: dist[u] },
    });
  }

  // --- dj.done ---
  // Highlight all nodes and SPT edges
  const allDistIds = labels.map((l) => `dj:d:${l}`);
  push({
    kind: "done",
    codeToken: "dj.done",
    narrationToken: "dj.done",
    focusNodes: [...labels.map(nodeId), ...allDistIds],
    focusEdges: Array.from(sptEdges),
    meta: { dist: { ...dist } },
  });

  return frames;
}
