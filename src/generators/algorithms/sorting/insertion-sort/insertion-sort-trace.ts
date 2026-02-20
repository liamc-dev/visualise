import type {
  TraceFrame,
  TraceNode,
  TracePointer,
  TraceScene,
} from "../../../../types/trace-types";
import { makeInsertionSortLayout } from "./insertion-sort-layout";

function cellId(index: number) {
  return `is:a:${index}`;
}

export function insertionSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: TraceFrame[] = [];
  const layout = makeInsertionSortLayout();
  let stepNo = 0;

  const sorted = new Set<number>();

  function buildScene(): TraceScene {
    const nodes: TraceNode[] = arr.map((value, idx) => ({
      id: cellId(idx),
      kind: "cell",
      pos: { x: layout.colOffset + idx, y: layout.arrayY },
      meta: {
        value,
        index: idx,
        emphasis: sorted.has(idx) ? ("soft" as const) : ("active" as const),
        ...(sorted.has(idx)
          ? { tone: "muted" as const, opacityMul: 0.45 }
          : undefined),
      },
    }));
    return { nodes };
  }

  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) {
    const scene = buildScene();
    const focusNodes: string[] = [];

    if (args.highlight?.length) {
      for (const idx of args.highlight) {
        focusNodes.push(cellId(idx));
      }
    }

    if (args.pointers?.length) {
      for (const p of args.pointers) {
        if (p.target.kind === "node") focusNodes.push(p.target.nodeId);
      }
    }

    frames.push({
      id: `is.${args.kind}.${stepNo++}`,
      kind: args.kind,
      codeToken: args.codeToken,
      narrationToken: args.narrationToken,
      scene,
      focus: {
        nodes: focusNodes.length ? focusNodes : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  }

  function iPointer(i: number): TracePointer {
    return {
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: cellId(i) },
      lane: "above",
      color: "var(--color-tn-cyan)",
    };
  }

  function jPointer(j: number): TracePointer {
    return {
      id: "j",
      label: "j",
      target: { kind: "node", nodeId: cellId(j) },
      lane: "above",
      color: "var(--color-tn-magenta)",
    };
  }

  function sortedPointer(): TracePointer[] {
    if (sorted.size === 0) return [];
    const maxSorted = Math.max(...sorted);
    return [
      {
        id: "sorted",
        label: "sorted",
        target: { kind: "node", nodeId: cellId(maxSorted) },
        lane: "below",
        color: "var(--color-tn-subtle)",
      },
    ];
  }

  // --- is.init ---
  push({
    kind: "init",
    codeToken: "is.init",
    narrationToken: "is.init",
    meta: { n },
  });

  // index 0 is trivially sorted
  sorted.add(0);

  // --- main loop ---
  for (let i = 1; i < n; i++) {
    const key = arr[i];

    // --- is.pick ---
    push({
      kind: "pick",
      codeToken: "is.pick",
      narrationToken: "is.pick",
      highlight: [i],
      pointers: [iPointer(i), ...sortedPointer()],
      meta: { i, key },
    });

    let j = i - 1;

    while (j >= 0) {
      const valJ = arr[j];

      // --- is.compare ---
      push({
        kind: "compare",
        codeToken: "is.compare",
        narrationToken: "is.compare",
        highlight: [j],
        pointers: [iPointer(i), jPointer(j), ...sortedPointer()],
        meta: { i, j, key, valJ },
      });

      if (arr[j] <= key) break;

      // --- is.shift ---
      arr[j + 1] = arr[j];

      push({
        kind: "shift",
        codeToken: "is.shift",
        narrationToken: "is.shift",
        highlight: [j, j + 1],
        pointers: [iPointer(i), jPointer(j), ...sortedPointer()],
        meta: { i, j, key, valJ },
      });

      j--;
    }

    // --- is.insert ---
    arr[j + 1] = key;

    push({
      kind: "insert",
      codeToken: "is.insert",
      narrationToken: "is.insert",
      highlight: [j + 1],
      pointers: [iPointer(i), ...sortedPointer()],
      meta: { i, j, key, insertPos: j + 1 },
    });

    sorted.add(i);
  }

  // --- is.done ---
  sorted.clear();

  push({
    kind: "done",
    codeToken: "is.done",
    narrationToken: "is.done",
    highlight: Array.from({ length: n }, (_, i) => i),
    meta: { n },
  });

  return frames;
}
