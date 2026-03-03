// src/generators/algorithms/pathfinding/dfs/dfs-graph-trace.ts
// DFS on the 6-node graph topology. Cells show discovery order (1, 2, 3...).

import type {
  TraceFrame,
  TracePointer,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import {
  buildAdj,
  buildGraphFromInput,
  edgeId,
  nodeId,
} from "./dfs-graph";
import { decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../../../lib/graph-utils";
import {
  buildScene,
  computeCurveVias,
  stackNodeId,
  STACK_MAX_VISIBLE,
  type DfsGraphState,
} from "./dfs-graph-layout";

/* ------------------------------------------------------------------ */
/*  Trace generator                                                   */
/* ------------------------------------------------------------------ */

export function dfsGraphTrace(input: number[]): TraceFrame[] {
  const encoded = input.length === 16 ? input : DEFAULT_DIJKSTRA_INPUT;
  const decoded = decodeGraphInput(encoded);
  const graph = buildGraphFromInput(decoded.source, decoded.edges);
  const adj = buildAdj(graph);

  const labels = graph.nodes.map((n) => n.label);

  // DFS state
  const order: Record<string, number> = {};
  const visited = new Set<string>();
  const stack: string[] = [];
  let curNode: string | null = null;
  let showResult = false;
  let orderCounter = 0;

  const treeEdges = new Set<string>();
  const curveVias = computeCurveVias(graph);

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  // Shared state object passed to buildScene
  const st: DfsGraphState = {
    graph, order, visited, stack, curNode, showResult, treeEdges, curveVias,
  };

  /* ---- frame pusher ---- */

  function push(args: {
    kind: string;
    codeToken: string;
    narrationToken: string;
    focusNodes?: string[];
    focusEdges?: string[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) {
    st.curNode = curNode;
    st.showResult = showResult;
    const scene = buildScene(st);

    applyPointerMasking(scene.nodes, args.pointers);

    frames.push({
      id: `dfs.${args.kind}.${stepNo++}`,
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
      id: "u", label: "u",
      target: { kind: "node", nodeId: nodeId(label) },
      lane: "above", color: "var(--color-tn-warning)",
    };
  }

  function vPointer(label: string): TracePointer {
    return {
      id: "v", label: "v",
      target: { kind: "node", nodeId: nodeId(label) },
      lane: "below", color: "var(--color-tn-cyan)",
    };
  }

  /* ================================================================ */
  /*  Algorithm                                                       */
  /* ================================================================ */

  // --- Init phase (6 frames) ---
  push({
    kind: "init.stack", codeToken: "dfs.init.stack",
    narrationToken: "dfs.init.stack",
    meta: { source: graph.source },
  });

  push({
    kind: "init.visited", codeToken: "dfs.init.visited",
    narrationToken: "dfs.init.visited",
  });

  push({
    kind: "init.order", codeToken: "dfs.init.order",
    narrationToken: "dfs.init.order",
  });

  visited.add(graph.source);
  push({
    kind: "init.mark", codeToken: "dfs.init.mark",
    narrationToken: "dfs.init.mark",
    focusNodes: [nodeId(graph.source)],
    meta: { source: graph.source },
  });

  orderCounter++;
  order[graph.source] = orderCounter;
  push({
    kind: "init.setorder", codeToken: "dfs.init.setorder",
    narrationToken: "dfs.init.setorder",
    focusNodes: [nodeId(graph.source)],
    meta: { source: graph.source, order: orderCounter },
  });

  stack.push(graph.source);
  push({
    kind: "init.push", codeToken: "dfs.init.push",
    narrationToken: "dfs.init.push",
    focusNodes: [nodeId(graph.source), stackNodeId(0)],
    meta: { source: graph.source },
  });

  // --- Main loop ---
  while (stack.length > 0) {
    push({
      kind: "loop", codeToken: "dfs.loop", narrationToken: "dfs.loop",
      focusNodes: stack.slice(-STACK_MAX_VISIBLE).reverse().map((_, i) => stackNodeId(i)),
      meta: { stackSize: stack.length },
    });

    const u = stack.pop()!;
    curNode = u;
    push({
      kind: "pop", codeToken: "dfs.pop", narrationToken: "dfs.pop",
      focusNodes: [nodeId(u), "dfs:cur"],
      pointers: [uPointer(u)],
      meta: { u, order: order[u] },
    });

    // Explore neighbors
    const neighbors = adj.get(u) ?? [];
    for (const { to: v } of neighbors) {
      const eid = edgeId(u, v);

      push({
        kind: "neighbors", codeToken: "dfs.neighbors",
        narrationToken: "dfs.neighbors",
        focusNodes: [nodeId(u), nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v },
      });

      const alreadyVisited = visited.has(v);
      push({
        kind: "visited", codeToken: "dfs.visited",
        narrationToken: "dfs.visited",
        focusNodes: [nodeId(u), nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v, result: alreadyVisited ? "fail" : "pass" },
      });
      if (alreadyVisited) continue;

      const newOrder = ++orderCounter;

      visited.add(v);
      push({
        kind: "mark", codeToken: "dfs.mark", narrationToken: "dfs.mark",
        focusNodes: [nodeId(u), nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v },
      });

      order[v] = newOrder;
      push({
        kind: "setorder", codeToken: "dfs.setorder",
        narrationToken: "dfs.setorder",
        focusNodes: [nodeId(u), nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v, order: newOrder },
      });

      stack.push(v);
      treeEdges.add(eid);
      const visibleIdx = Math.min(stack.length - 1, STACK_MAX_VISIBLE - 1);
      push({
        kind: "push", codeToken: "dfs.push", narrationToken: "dfs.push",
        focusNodes: [nodeId(u), nodeId(v), stackNodeId(visibleIdx)],
        focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        meta: { u, v, order: newOrder },
      });
    }

    curNode = null;
  }

  // --- Done ---
  showResult = true;
  st.showResult = true;
  st.curNode = null;
  const reachableIds = labels.filter((l) => visited.has(l)).map(nodeId);

  const doneScene = buildScene(st);
  doneScene.overlays!.push({
    kind: "caption" as const,
    id: "dfs:result-label",
    x: 6,
    y: 0,
    text: `Discovery order from ${graph.source}`,
    emphasis: "soft" as const,
  });

  frames.push({
    id: `dfs.done.${stepNo++}`,
    kind: "done",
    codeToken: "dfs.done",
    narrationToken: "dfs.done",
    scene: doneScene,
    focus: {
      nodes: reachableIds,
      edges: Array.from(treeEdges),
    },
    meta: { totalVisited: visited.size },
  });

  return frames;
}
