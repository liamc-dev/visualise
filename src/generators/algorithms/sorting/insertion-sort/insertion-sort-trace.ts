import type {
  TraceFrame,
  TraceNode,
  TracePointer,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import { makeInsertionSortLayout } from "./insertion-sort-layout";

const KEY_NODE_ID = "is:key";

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
  // In insertion sort the sorted prefix is the *active workspace* — we dim
  // elements we haven't reached yet (i+1..n-1) instead.
  let currentI: number | undefined;

  function buildScene(keyNode?: { value: number; x: number }, toneOverrides?: Record<number, TraceTone>): TraceScene {
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
          ...(toneOverrides?.[idx] ? { tone: toneOverrides[idx] } : undefined),
        },
      };
    });

    if (keyNode) {
      nodes.push({
        id: KEY_NODE_ID,
        kind: "cell",
        pos: { x: layout.colOffset + keyNode.x, y: layout.arrayY - 1 },
        meta: {
          value: keyNode.value,
          emphasis: "active" as const,
          tone: "warning" as const,
        },
      });
    }

    return { nodes };
  }

  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    toneOverrides?: Record<number, TraceTone>;
    meta?: Record<string, unknown>;
    keyNode?: { value: number; x: number };
  }) {
    const scene = buildScene(args.keyNode, args.toneOverrides);
    const focusNodes: string[] = [];

    if (args.keyNode) {
      focusNodes.push(KEY_NODE_ID);
    }

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
      lane: "below",
      color: "var(--color-tn-cyan)",
    };
  }

  function jPointer(j: number): TracePointer {
    return {
      id: "j",
      label: "j",
      target: { kind: "node", nodeId: cellId(j) },
      lane: "below",
      color: "var(--color-tn-magenta)",
    };
  }

  const keyPointer: TracePointer = {
    id: "key",
    label: "key",
    target: { kind: "node", nodeId: KEY_NODE_ID },
    lane: "above",
    color: "var(--color-tn-warning)",
  };

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

    // --- is.pick — lift the key out of the array ---
    push({
      kind: "pick",
      codeToken: "is.pick",
      narrationToken: "is.pick",
      highlight: [i],
      pointers: [iPointer(i), keyPointer],
      keyNode: { value: key, x: i },
      meta: { i, key },
    });

    let j = i - 1;

    while (j >= 0) {
      const valJ = arr[j];

      // --- is.compare — key hovers above a[j] for face-off ---
      push({
        kind: "compare",
        codeToken: "is.compare",
        narrationToken: "is.compare",
        highlight: [j],
        pointers: [iPointer(i), jPointer(j), keyPointer],
        toneOverrides: { [j]: "magenta" },
        keyNode: { value: key, x: j },
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
        pointers: [iPointer(i), jPointer(j), keyPointer],
        toneOverrides: { [j]: "magenta" },
        keyNode: { value: key, x: j },
        meta: { i, j, key, valJ },
      });

      j--;
    }

    // --- is.insert — key drops into the gap ---
    arr[j + 1] = key;

    push({
      kind: "insert",
      codeToken: "is.insert",
      narrationToken: "is.insert",
      highlight: [j + 1],
      pointers: [iPointer(i)],
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
