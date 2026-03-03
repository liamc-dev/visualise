// src/generators/algorithms/pathfinding/prims/prims-trace.ts
import type {
  TraceFrame,
  TracePointer,
  TraceTone,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import {
  buildGraphFromInput,
  buildAdj,
  edgeId,
  nodeId,
} from "./prims-graph";
import { decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../../../lib/graph-utils";
import {
  buildScene,
  computeCurveVias,
  type PrimsState,
  type BuildSceneOpts,
} from "./prims-layout";

/* ------------------------------------------------------------------ */
/*  Trace generator                                                   */
/* ------------------------------------------------------------------ */

export function primsTrace(input: number[]): TraceFrame[] {
  const encoded = input.length === 16 ? input : DEFAULT_DIJKSTRA_INPUT;
  const decoded = decodeGraphInput(encoded);
  const graph = buildGraphFromInput(decoded.source, decoded.edges);

  const labels = graph.nodes.map((n) => n.label);
  const V = labels.length;
  const adj = buildAdj(graph);

  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const inMST = new Set<string>();

  for (const l of labels) {
    key[l] = Infinity;
    parent[l] = null;
  }
  key[graph.source] = 0;

  const mstEdges = new Set<string>();
  const curveVias = computeCurveVias(graph);

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  // Shared state object passed to buildScene
  const st: PrimsState = {
    graph, labels, key, parent, inMST, mstEdges, curveVias,
  };

  /* ---- frame pusher ---- */

  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    focusNodes?: string[];
    focusEdges?: string[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  } & BuildSceneOpts) {
    const scene = buildScene(st, {
      highlightEdge: args.highlightEdge,
      highlightEdgeColor: args.highlightEdgeColor,
      keyToneOverrides: args.keyToneOverrides,
      keyWeightOverrides: args.keyWeightOverrides,
      parentToneOverrides: args.parentToneOverrides,
    });

    applyPointerMasking(scene.nodes, args.pointers);

    frames.push({
      id: `pr.${args.kind}.${stepNo++}`,
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

  // --- init (3 granular frames) ---
  push({
    kind: "init.key",
    codeToken: "prim.init.key",
    narrationToken: "prim.init.key",
    focusNodes: labels.map((l) => `pr:k:${l}`),
    meta: { source: graph.source, V },
  });
  push({
    kind: "init.parent",
    codeToken: "prim.init.parent",
    narrationToken: "prim.init.parent",
    focusNodes: labels.map((l) => `pr:p:${l}`),
    meta: { source: graph.source },
  });
  push({
    kind: "init.mst",
    codeToken: "prim.init.mst",
    narrationToken: "prim.init.mst",
    meta: { source: graph.source },
  });

  // --- source ---
  push({
    kind: "source",
    codeToken: "prim.source",
    narrationToken: "prim.source",
    focusNodes: [nodeId(graph.source), `pr:k:${graph.source}`],
    meta: { source: graph.source },
  });

  // --- main loop ---
  while (inMST.size < V) {
    push({
      kind: "loop",
      codeToken: "prim.loop",
      narrationToken: "prim.loop",
      meta: { unvisitedCount: V - inMST.size },
    });

    // pick.scan — announce
    push({
      kind: "pick.scan",
      codeToken: "prim.pick.scan",
      narrationToken: "prim.pick.scan",
      focusNodes: labels.filter((l) => !inMST.has(l)).map((l) => `pr:k:${l}`),
    });

    // pick — per-node scan
    let u: string | null = null;
    let minKey = Infinity;
    for (const l of labels) {
      if (inMST.has(l)) {
        push({
          kind: "pick.check", codeToken: "prim.pick.check",
          narrationToken: "prim.pick.check",
          focusNodes: [nodeId(l), `pr:k:${l}`],
          meta: { candidate: l, keyVal: key[l], best: minKey, inMST: true },
        });
        continue;
      }
      push({
        kind: "pick.check", codeToken: "prim.pick.check",
        narrationToken: "prim.pick.check",
        focusNodes: [nodeId(l), `pr:k:${l}`],
        keyToneOverrides: { [l]: "warning" },
        meta: { candidate: l, keyVal: key[l], best: minKey, inMST: false },
      });
      if (key[l] < minKey) {
        minKey = key[l];
        u = l;
        push({
          kind: "pick.best", codeToken: "prim.pick.best",
          narrationToken: "prim.pick.best",
          focusNodes: [nodeId(l), `pr:k:${l}`],
          keyToneOverrides: { [l]: "accent" },
          keyWeightOverrides: { [l]: 1 },
          meta: { candidate: l, keyVal: key[l] },
        });
      }
    }
    if (u === null) break;

    // pick — result
    push({
      kind: "pick", codeToken: "prim.pick", narrationToken: "prim.pick",
      focusNodes: [nodeId(u), `pr:k:${u}`],
      pointers: [uPointer(u)],
      keyToneOverrides: { [u]: "accent" },
      keyWeightOverrides: { [u]: 1 },
      meta: { u, keyU: key[u] },
    });

    // add to MST
    inMST.add(u);
    if (parent[u] !== null) mstEdges.add(edgeId(parent[u]!, u));

    push({
      kind: "add", codeToken: "prim.add", narrationToken: "prim.add",
      focusNodes: [nodeId(u)],
      focusEdges: parent[u] !== null ? [edgeId(parent[u]!, u)] : undefined,
      pointers: [uPointer(u)],
      meta: { u, parentU: parent[u] },
    });

    // explore neighbors
    for (const { to: v, weight: w } of adj.get(u)!) {
      const eid = edgeId(u, v);

      push({
        kind: "neighbors", codeToken: "prim.neighbors",
        narrationToken: "prim.neighbors",
        focusNodes: [nodeId(u), nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        highlightEdge: eid, meta: { u, v, w },
      });

      const isInMST = inMST.has(v);
      push({
        kind: "check", codeToken: "prim.check", narrationToken: "prim.check",
        focusNodes: [nodeId(v)], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        highlightEdge: eid,
        meta: { u, v, w, result: isInMST ? "fail" : "pass" },
      });
      if (isInMST) continue;

      push({
        kind: "relax", codeToken: "prim.relax", narrationToken: "prim.relax",
        focusNodes: [nodeId(u), nodeId(v), `pr:k:${v}`], focusEdges: [eid],
        pointers: [uPointer(u), vPointer(v)],
        highlightEdge: eid, meta: { u, v, w, currentKey: key[v] },
      });

      if (w < key[v]) {
        const oldKey = key[v];
        key[v] = w;
        parent[v] = u;

        push({
          kind: "update.key", codeToken: "prim.update.key",
          narrationToken: "prim.update.key",
          focusNodes: [nodeId(v), `pr:k:${v}`], focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)], highlightEdge: eid,
          keyToneOverrides: { [v]: "accent" }, keyWeightOverrides: { [v]: 1 },
          meta: { u, v, w, oldKey: oldKey === Infinity ? "\u221e" : oldKey, newKey: w },
        });
        push({
          kind: "update.parent", codeToken: "prim.update.parent",
          narrationToken: "prim.update.parent",
          focusNodes: [nodeId(v), `pr:p:${v}`], focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)], highlightEdge: eid,
          parentToneOverrides: { [v]: "accent" }, meta: { u, v },
        });
      } else {
        push({
          kind: "skip", codeToken: "prim.relax", narrationToken: "prim.skip",
          focusNodes: [nodeId(u), nodeId(v), `pr:k:${v}`], focusEdges: [eid],
          pointers: [uPointer(u), vPointer(v)],
          highlightEdge: eid, meta: { u, v, currentKey: key[v], w },
        });
      }
    }
  }

  // --- done ---
  const totalWeight = labels.reduce((sum, l) => {
    return key[l] < Infinity ? sum + key[l] : sum;
  }, 0);

  push({
    kind: "done", codeToken: "prim.done", narrationToken: "prim.done",
    focusNodes: [
      ...labels.map(nodeId),
      ...labels.map((l) => `pr:k:${l}`),
      ...labels.map((l) => `pr:p:${l}`),
    ],
    focusEdges: Array.from(mstEdges),
    meta: { key: { ...key }, parent: { ...parent }, totalWeight },
  });

  return frames;
}
