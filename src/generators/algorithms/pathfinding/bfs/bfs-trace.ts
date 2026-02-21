import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import {
  DEFAULT_BFS_GRAPH,
  buildAdj,
  edgeId,
  nodeId,
  type Graph,
  type GraphNode,
} from "./bfs-graph";

const BOUNDS = { minX: 0, minY: 0, maxX: 12, maxY: 10 };
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

/* Helpers */

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

/* Trace generator */

export function bfsTrace(_input: number[]): TraceFrame[] {
  const graph = DEFAULT_BFS_GRAPH;
  const adj = buildAdj(graph);

  const labels = graph.nodes.map((n) => n.label);

  const level: Record<string, number> = {};
  const discovered = new Set<string>();
  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const treeEdges = new Set<string>();

  for (const l of labels) {
    level[l] = -1;
    parent[l] = null;
  }

  level[graph.source] = 0;
  discovered.add(graph.source);

  const queue: string[] = [graph.source];

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  /* scene builder */
  function buildScene(): TraceScene {
    const nodes: TraceNode[] = graph.nodes.map((gn) => {
      const lv = level[gn.label];
      const isVisited = visited.has(gn.label);
      const isDiscovered = discovered.has(gn.label);

      let tone: TraceNode["meta"] extends { tone?: infer T } ? T : never;
      let emphasis: TraceNode["meta"] extends { emphasis?: infer E }
        ? E
        : never;

      if (isVisited) {
        tone = "neutral";
        emphasis = "soft";
      } else if (isDiscovered) {
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
          value: lv < 0 ? "\u2014" : lv,
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
      const inTree = treeEdges.has(eid);

      return {
        id: eid,
        from: nodeId(ge.from),
        to: nodeId(ge.to),
        kind: "graph",
        meta: {
          arrow: inTree,
          fromPt: edgeEndpoint(fromPos, toPos),
          toPt: edgeEndpoint(toPos, fromPos),
          color: inTree
            ? "rgb(var(--tn-accent) / 0.70)"
            : "rgb(var(--tn-accent) / 0.35)",
          opacity: inTree ? 0.7 : 0.25,
        },
      };
    });

    // Node label captions (above each node)
    const labelOverlays: TraceOverlay[] = graph.nodes.map((gn) => ({
      kind: "caption" as const,
      id: `bfs:label:${gn.label}`,
      x: gn.x,
      y: gn.y - 0.8,
      text: gn.label,
    }));

    return {
      nodes,
      edges,
      overlays: labelOverlays,
      bounds: BOUNDS,
    };
  }

  /* frame pusher */
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

    frames.push({
      id: `bfs.${args.kind}.${stepNo++}`,
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

  /* pointer helpers */
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

  /* Algorithm execution with frame emissions */

  // bfs.init
  push({
    kind: "init",
    codeToken: "bfs.init",
    narrationToken: "bfs.init",
    focusNodes: [nodeId(graph.source)],
    meta: { source: graph.source, queue: [...queue] },
  });

  // main loop
  while (queue.length > 0) {
    const u = queue.shift()!;

    // bfs.dequeue
    push({
      kind: "dequeue",
      codeToken: "bfs.dequeue",
      narrationToken: "bfs.dequeue",
      focusNodes: [nodeId(u)],
      pointers: [uPointer(u)],
      meta: { u, level: level[u], queue: [...queue] },
    });

    const neighbors = adj.get(u)!;
    for (const v of neighbors) {
      const eid = edgeId(u, v);

      // bfs.explore
      push({
        kind: "explore",
        codeToken: "bfs.explore",
        narrationToken: "bfs.explore",
        focusNodes: [nodeId(u), nodeId(v)],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v },
      });

      if (!discovered.has(v)) {
        level[v] = level[u] + 1;
        parent[v] = u;
        discovered.add(v);
        queue.push(v);
        treeEdges.add(eid);

        // bfs.discover
        push({
          kind: "discover",
          codeToken: "bfs.discover",
          narrationToken: "bfs.discover",
          focusNodes: [nodeId(v)],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          meta: { u, v, level: level[v], queue: [...queue] },
        });
      } else {
        // bfs.skip
        push({
          kind: "skip",
          codeToken: "bfs.explore",
          narrationToken: "bfs.skip",
          focusNodes: [nodeId(u), nodeId(v)],
          focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          meta: { u, v },
        });
      }
    }

    visited.add(u);
  }

  // bfs.done — show final BFS tree
  // Override node styling: all nodes accent, all tree edges highlighted
  const doneScene = buildScene();
  for (const node of doneScene.nodes) {
    node.meta = {
      ...node.meta,
      tone: "accent",
      emphasis: undefined,
      opacityMul: undefined,
    };
  }
  // Dim cross edges further
  for (const edge of doneScene.edges) {
    const inTree = treeEdges.has(edge.id);
    edge.meta = {
      ...edge.meta,
      color: inTree
        ? "rgb(var(--tn-accent) / 0.70)"
        : "rgb(var(--tn-accent) / 0.20)",
      opacity: inTree ? 0.7 : 0.2,
    };
  }

  frames.push({
    id: `bfs.done.${stepNo++}`,
    kind: "done",
    codeToken: "bfs.done",
    narrationToken: "bfs.done",
    scene: doneScene,
    focus: {
      nodes: labels.map(nodeId),
      edges: Array.from(treeEdges),
    },
    meta: { level: { ...level } },
  });

  return frames;
}
