// src/generators/algorithms/pathfinding/kruskals/kruskals-trace.ts
import type {
  TraceFrame,
  TracePointer,
  TraceTone,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import {
  buildGraphFromInput,
  edgeId,
  nodeId,
} from "./kruskals-graph";
import { decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../../../lib/graph-utils";
import {
  buildScene,
  computeCurveVias,
  type KruskalsState,
  type BuildSceneOpts,
  type SortedEdge,
} from "./kruskals-layout";

/* ------------------------------------------------------------------ */
/*  Trace generator                                                   */
/* ------------------------------------------------------------------ */

export function kruskalsTrace(input: number[]): TraceFrame[] {
  const encoded = input.length === 16 ? input : DEFAULT_DIJKSTRA_INPUT;
  const decoded = decodeGraphInput(encoded);
  const graph = buildGraphFromInput(decoded.source, decoded.edges);

  const labels = graph.nodes.map((n) => n.label);
  const curveVias = computeCurveVias(graph);

  // Build and sort edge list
  const sortedEdges: SortedEdge[] = graph.edges
    .map((ge) => ({ from: ge.from, to: ge.to, weight: ge.weight }))
    .sort((a, b) => a.weight - b.weight);

  const edgeStatuses: ("pending" | "accepted" | "skipped")[] =
    sortedEdges.map(() => "pending");

  // DSU parent
  const parent: Record<string, string> = {};
  for (const l of labels) parent[l] = l;

  const mstEdges = new Set<string>();

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  const st: KruskalsState = {
    graph, labels, parent, mstEdges, sortedEdges, edgeStatuses,
    edgeIndex: -1, curveVias,
  };

  // Pointer-matched tones — set per edge iteration, auto-merged into every frame
  let curNodeTones: Record<string, TraceTone> = {};
  let curParentTones: Record<string, TraceTone> = {};

  type PushArgs = {
    kind: string; codeToken?: string; narrationToken?: string;
    focusNodes?: string[]; focusEdges?: string[];
    pointers?: TracePointer[]; meta?: Record<string, unknown>;
  } & BuildSceneOpts;

  function push(args: PushArgs) {
    const scene = buildScene(st, {
      highlightEdge: args.highlightEdge,
      highlightEdgeColor: args.highlightEdgeColor,
      nodeToneOverrides: { ...curNodeTones, ...args.nodeToneOverrides },
      parentToneOverrides: { ...curParentTones, ...args.parentToneOverrides },
    });
    if (st.edgeIndex >= 0 && st.edgeIndex < sortedEdges.length) {
      const cell = scene.nodes.find((n) => n.id === `kr:se:${st.edgeIndex}`);
      if (cell && edgeStatuses[st.edgeIndex] === "pending")
        cell.meta = { ...cell.meta, tone: "warning" as TraceTone, weight: 1 };
    }
    applyPointerMasking(scene.nodes, args.pointers);
    frames.push({
      id: `kr.${args.kind}.${stepNo++}`, kind: args.kind,
      codeToken: args.codeToken, narrationToken: args.narrationToken, scene,
      focus: {
        nodes: args.focusNodes?.length ? args.focusNodes : undefined,
        edges: args.focusEdges?.length ? args.focusEdges : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  }

  const uPointer = (label: string): TracePointer => ({
    id: "u", label: "u", lane: "above", color: "var(--color-tn-warning)",
    target: { kind: "node", nodeId: nodeId(label) },
  });
  const vPointer = (label: string): TracePointer => ({
    id: "v", label: "v", lane: "below", color: "var(--color-tn-cyan)",
    target: { kind: "node", nodeId: nodeId(label) },
  });

  /** Traced find — steps through the find body line-by-line. */
  function tracedFind(
    startNode: string, findKind: "find" | "find2",
    eu: string, ev: string, ew: number, eid: string, rootUVal?: string,
  ): string {
    let x = startNode;
    const ptrs = [uPointer(eu), vPointer(ev)];
    const base = { u: eu, v: ev, w: ew };

    while (parent[x] !== x) {
      const px = parent[x];
      push({
        kind: `${findKind}.check`, codeToken: "kruskal.find.check",
        narrationToken: "kruskal.find.check", focusNodes: [`kr:p:${x}`, nodeId(x)],
        pointers: ptrs, highlightEdge: eid, parentToneOverrides: { [x]: "warning" },
        meta: { ...base, node: x, parentNode: px, isRoot: false },
      });
      push({
        kind: `${findKind}.up`, codeToken: "kruskal.find.up",
        narrationToken: "kruskal.find.up", focusNodes: [`kr:p:${x}`, nodeId(px)],
        pointers: ptrs, highlightEdge: eid, parentToneOverrides: { [x]: "warning" },
        meta: { ...base, node: x, newNode: px },
      });
      x = px;
    }

    // while condition false → root found
    push({
      kind: `${findKind}.check`, codeToken: "kruskal.find.check",
      narrationToken: "kruskal.find.check", focusNodes: [`kr:p:${x}`, nodeId(x)],
      pointers: ptrs, highlightEdge: eid, parentToneOverrides: { [x]: "accent" },
      meta: { ...base, node: x, parentNode: x, isRoot: true },
    });
    // result at call site
    push({
      kind: findKind, codeToken: `kruskal.${findKind}`,
      narrationToken: `kruskal.${findKind}`,
      focusNodes: [nodeId(startNode), `kr:p:${startNode}`],
      pointers: ptrs, highlightEdge: eid, parentToneOverrides: { [x]: "accent" },
      meta: {
        ...base,
        ...(findKind === "find" ? { rootU: x } : { rootU: rootUVal, rootV: x }),
      },
    });
    return x;
  }

  /* ================================================================ */
  /*  Algorithm                                                       */
  /* ================================================================ */

  // --- sort edges ---
  push({
    kind: "sort",
    codeToken: "kruskal.sort",
    narrationToken: "kruskal.sort",
    focusNodes: sortedEdges.map((_, i) => `kr:se:${i}`),
    meta: { edgeCount: sortedEdges.length },
  });

  // --- init DSU ---
  push({
    kind: "dsu",
    codeToken: "kruskal.dsu",
    narrationToken: "kruskal.dsu",
    focusNodes: labels.map((l) => `kr:p:${l}`),
  });

  // --- init MST ---
  push({
    kind: "mst",
    codeToken: "kruskal.mst",
    narrationToken: "kruskal.mst",
  });

  // --- main loop ---
  for (let i = 0; i < sortedEdges.length; i++) {
    const se = sortedEdges[i];
    const { from: eu, to: ev, weight: ew } = se;
    const eid = edgeId(eu, ev);
    st.edgeIndex = i;
    curNodeTones = { [eu]: "warning", [ev]: "cyan" };
    curParentTones = { [eu]: "warning", [ev]: "cyan" };

    // loop — consider this edge
    push({
      kind: "loop",
      codeToken: "kruskal.loop",
      narrationToken: "kruskal.loop",
      focusNodes: [nodeId(eu), nodeId(ev), `kr:se:${i}`],
      focusEdges: [eid],
      pointers: [uPointer(eu), vPointer(ev)],
      highlightEdge: eid,
      meta: { u: eu, v: ev, w: ew },
    });

    // find rootU (traced walk up parent chain)
    const rootU = tracedFind(eu, "find", eu, ev, ew, eid);

    // find rootV (traced walk up parent chain)
    const rootV = tracedFind(ev, "find2", eu, ev, ew, eid, rootU);

    // check — same or different?
    const same = rootU === rootV;
    push({
      kind: "check",
      codeToken: "kruskal.check",
      narrationToken: "kruskal.check",
      focusNodes: [nodeId(eu), nodeId(ev)],
      pointers: [uPointer(eu), vPointer(ev)],
      highlightEdge: eid,
      meta: { u: eu, v: ev, w: ew, rootU, rootV, same },
    });

    if (!same) {
      // add edge to MST
      mstEdges.add(eid);
      edgeStatuses[i] = "accepted";

      push({
        kind: "add",
        codeToken: "kruskal.add",
        narrationToken: "kruskal.add",
        focusNodes: [nodeId(eu), nodeId(ev), `kr:se:${i}`],
        focusEdges: [eid],
        pointers: [uPointer(eu), vPointer(ev)],
        meta: { u: eu, v: ev, w: ew },
      });

      // union
      parent[rootU] = rootV;

      push({
        kind: "union",
        codeToken: "kruskal.union",
        narrationToken: "kruskal.union",
        focusNodes: [`kr:p:${rootU}`],
        pointers: [uPointer(eu), vPointer(ev)],
        parentToneOverrides: { [rootU]: "accent" },
        meta: { u: eu, v: ev, w: ew, rootU, rootV },
      });
    } else {
      // skip — would create cycle
      edgeStatuses[i] = "skipped";

      push({
        kind: "skip",
        codeToken: "kruskal.skip",
        narrationToken: "kruskal.skip",
        focusNodes: [nodeId(eu), nodeId(ev), `kr:se:${i}`],
        focusEdges: [eid],
        pointers: [uPointer(eu), vPointer(ev)],
        highlightEdge: eid,
        highlightEdgeColor: "rgb(var(--tn-danger) / 0.60)",
        meta: { u: eu, v: ev, w: ew, rootU, rootV },
      });
    }
  }

  // --- done ---
  curNodeTones = {};
  curParentTones = {};
  st.edgeIndex = -1;

  const totalWeight = sortedEdges.reduce((sum, se, i) =>
    edgeStatuses[i] === "accepted" ? sum + se.weight : sum, 0,
  );
  const mstCount = edgeStatuses.filter((s) => s === "accepted").length;

  push({
    kind: "done",
    codeToken: "kruskal.done",
    narrationToken: "kruskal.done",
    focusNodes: [
      ...labels.map(nodeId),
      ...labels.map((l) => `kr:p:${l}`),
    ],
    focusEdges: Array.from(mstEdges),
    meta: { totalWeight, edgeCount: mstCount },
  });

  return frames;
}
