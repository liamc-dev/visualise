import type { TraceFrame, TraceNode, TracePointer, TraceScene, TraceTone } from "../../../../types/trace-types";
import { makeSelectionSortLayout } from "./selection-sort-layout";

function cellId(index: number) {
  return `ss:a:${index}`;
}

export function selectionSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: TraceFrame[] = [];
  const layout = makeSelectionSortLayout();
  let stepNo = 0;

  // Track which indices are in their final sorted position
  const sorted = new Set<number>();

  function buildScene(toneOverrides?: Record<number, TraceTone>): TraceScene {
    const nodes: TraceNode[] = arr.map((value, idx) => ({
      id: cellId(idx),
      kind: "cell",
      pos: { x: layout.colOffset + idx, y: layout.arrayY },
      meta: {
        value,
        index: idx,
        emphasis: sorted.has(idx) ? "soft" as const : "active" as const,
        ...(sorted.has(idx) ? { tone: "muted" as const, opacityMul: 0.45 } : undefined),
        ...(toneOverrides?.[idx] ? { tone: toneOverrides[idx] } : undefined),
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
    toneOverrides?: Record<number, TraceTone>;
    meta?: Record<string, unknown>;
  }) {
    const scene = buildScene(args.toneOverrides);
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
      id: `ss.${args.kind}.${stepNo++}`,
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
      color: "var(--color-tn-warning)",
    };
  }

  function jPointer(j: number): TracePointer {
    return {
      id: "j",
      label: "j",
      target: { kind: "node", nodeId: cellId(j) },
      lane: "below",
      color: "var(--color-tn-cyan)",
    };
  }

  function minPointer(min: number): TracePointer {
    return {
      id: "min",
      label: "min",
      target: { kind: "node", nodeId: cellId(min) },
      lane: "above",
      color: "var(--color-tn-magenta)",
    };
  }

  // --- ss.init ---
  push({
    kind: "init",
    codeToken: "ss.init",
    narrationToken: "ss.init",
    meta: { n },
  });

  // --- main loop ---
  for (let i = 0; i < n - 1; i++) {
    let min = i;

    // ss.search_start
    push({
      kind: "search_start",
      codeToken: "ss.search_start",
      narrationToken: "ss.search_start",
      highlight: [i],
      pointers: [iPointer(i), minPointer(min)],
      toneOverrides: { [min]: "magenta" },
      meta: { i, minVal: arr[min], n },
    });

    for (let j = i + 1; j < n; j++) {
      const valJ = arr[j];
      const valMin = arr[min];

      // ss.compare
      push({
        kind: "compare",
        codeToken: "ss.compare",
        narrationToken: "ss.compare",
        highlight: [j, min],
        pointers: [iPointer(i), jPointer(j), minPointer(min)],
        toneOverrides: { [min]: "magenta" },
        meta: { i, j, min, valJ, valMin },
      });

      if (arr[j] < arr[min]) {
        min = j;

        // ss.new_min
        push({
          kind: "new_min",
          codeToken: "ss.new_min",
          narrationToken: "ss.new_min",
          highlight: [min],
          pointers: [iPointer(i), jPointer(j), minPointer(min)],
          toneOverrides: { [min]: "magenta" },
          meta: { i, j, min, valJ, valMin },
        });
      }
    }

    if (min !== i) {
      const valI = arr[i];
      const valMin = arr[min];

      // swap
      [arr[i], arr[min]] = [arr[min], arr[i]];

      // ss.swap
      push({
        kind: "swap",
        codeToken: "ss.swap",
        narrationToken: "ss.swap",
        highlight: [i, min],
        pointers: [iPointer(i), minPointer(min)],
        toneOverrides: { [min]: "magenta" },
        meta: { i, min, valI, valMin },
      });
    }

    // mark position i as sorted
    sorted.add(i);

    // ss.place_done
    push({
      kind: "place_done",
      codeToken: "ss.place_done",
      narrationToken: "ss.place_done",
      highlight: [i],
      pointers: [iPointer(i)],
      meta: { i, value: arr[i] },
    });
  }

  // last element is trivially sorted
  sorted.clear();

  // ss.done
  push({
    kind: "done",
    codeToken: "ss.done",
    narrationToken: "ss.done",
    highlight: Array.from({ length: n }, (_, i) => i),
    meta: { n },
  });

  return frames;
}
