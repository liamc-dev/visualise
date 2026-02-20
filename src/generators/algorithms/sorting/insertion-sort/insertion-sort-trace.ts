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

  // Track which iteration we're on so we can dim the unsorted tail.
  // In insertion sort the sorted prefix (0..i-1) is the *active workspace*
  // — dimming it would hide the comparisons and shifts. Instead we dim
  // elements we haven't reached yet (i+1..n-1).
  let currentI: number | undefined;

  function buildScene(): TraceScene {
    const nodes: TraceNode[] = arr.map((value, idx) => {
      const isUnsorted = currentI !== undefined && idx > currentI;
      return {
        id: cellId(idx),
        kind: "cell",
        pos: { x: layout.colOffset + idx, y: layout.arrayY },
        meta: {
          value,
          index: idx,
          emphasis: isUnsorted ? ("soft" as const) : ("active" as const),
          ...(isUnsorted
            ? { tone: "muted" as const, opacityMul: 0.45 }
            : undefined),
        },
      };
    });
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

  function sortedPointer(i: number): TracePointer[] {
    if (i < 1) return [];
    return [
      {
        id: "sorted",
        label: "sorted",
        target: { kind: "node", nodeId: cellId(i - 1) },
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

  // --- main loop ---
  for (let i = 1; i < n; i++) {
    currentI = i;
    const key = arr[i];

    // --- is.pick ---
    push({
      kind: "pick",
      codeToken: "is.pick",
      narrationToken: "is.pick",
      highlight: [i],
      pointers: [iPointer(i), ...sortedPointer(i)],
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
        pointers: [iPointer(i), jPointer(j), ...sortedPointer(i)],
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
        pointers: [iPointer(i), jPointer(j), ...sortedPointer(i)],
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
      pointers: [iPointer(i), ...sortedPointer(i)],
      meta: { i, j, key, insertPos: j + 1 },
    });
  }

  // --- is.done ---
  currentI = undefined;

  push({
    kind: "done",
    codeToken: "is.done",
    narrationToken: "is.done",
    highlight: Array.from({ length: n }, (_, i) => i),
    meta: { n },
  });

  return frames;
}
