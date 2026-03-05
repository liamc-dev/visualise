import type { TraceFrame, TraceNode, TraceOverlay, TracePointer, TraceScene, TraceTone } from "../../../../types/trace-types";
import { createOpsChart, quadraticRef } from "../../../../lib/ops-chart";
import { makeBubbleSortLayout } from "./bubble-sort-layout";

function cellId(index: number) {
  return `bs:a:${index}`;
}

export function bubbleSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: TraceFrame[] = [];
  const layout = makeBubbleSortLayout();
  let stepNo = 0;
  const opsChart = createOpsChart(quadraticRef(n));

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

    const overlays: TraceOverlay[] = [];
    const chart = opsChart.overlay();
    if (chart) overlays.push(chart);

    return { nodes, overlays: overlays.length ? overlays : undefined };
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
      id: `bs.${args.kind}.${stepNo++}`,
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

  function jPointers(j: number): TracePointer[] {
    return [
      {
        id: "j",
        label: "j",
        target: { kind: "node", nodeId: cellId(j) },
        lane: "above",
        color: "var(--color-tn-cyan)",
      },
      {
        id: "j+1",
        label: "j+1",
        target: { kind: "node", nodeId: cellId(j + 1) },
        lane: "above",
        color: "var(--color-tn-magenta)",
      },
    ];
  }

  function sortedPointer(): TracePointer[] {
    if (sorted.size === 0) return [];
    const minSorted = Math.min(...sorted);
    return [
      {
        id: "sorted",
        label: "sorted",
        target: { kind: "node", nodeId: cellId(minSorted) },
        lane: "below",
        color: "var(--color-tn-subtle)",
      },
    ];
  }

  // --- bs.init ---
  push({
    kind: "init",
    codeToken: "bs.init",
    narrationToken: "bs.init",
    meta: { n },
  });

  // --- main loop ---
  for (let i = 0; i < n - 1; i++) {
    // bs.pass_start
    push({
      kind: "pass_start",
      codeToken: "bs.pass_start",
      narrationToken: "bs.pass_start",
      pointers: sortedPointer(),
      meta: { pass: i, n },
    });

    for (let j = 0; j < n - i - 1; j++) {
      const valJ = arr[j];
      const valJ1 = arr[j + 1];

      // bs.compare
      opsChart.record();
      push({
        kind: "compare",
        codeToken: "bs.compare",
        narrationToken: "bs.compare",
        highlight: [j, j + 1],
        pointers: [...jPointers(j), ...sortedPointer()],
        toneOverrides: { [j]: "cyan", [j + 1]: "magenta" },
        meta: { j, valJ, valJ1, pass: i },
      });

      if (arr[j] > arr[j + 1]) {
        // swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        // bs.swap
        push({
          kind: "swap",
          codeToken: "bs.swap",
          narrationToken: "bs.swap",
          highlight: [j, j + 1],
          pointers: [...jPointers(j), ...sortedPointer()],
          toneOverrides: { [j]: "cyan", [j + 1]: "magenta" },
          meta: { j, valJ, valJ1, pass: i, swapped: true },
        });
      } else {
        // bs.no_swap
        push({
          kind: "no_swap",
          codeToken: "bs.no_swap",
          narrationToken: "bs.no_swap",
          highlight: [j, j + 1],
          pointers: [...jPointers(j), ...sortedPointer()],
          toneOverrides: { [j]: "cyan", [j + 1]: "magenta" },
          meta: { j, valJ, valJ1, pass: i, swapped: false },
        });
      }
    }

    // mark rightmost unsorted element as sorted
    sorted.add(n - i - 1);

    // bs.pass_done
    push({
      kind: "pass_done",
      codeToken: "bs.pass_done",
      narrationToken: "bs.pass_done",
      highlight: [n - i - 1],
      pointers: sortedPointer(),
      meta: { pass: i, sortedIndex: n - i - 1, value: arr[n - i - 1] },
    });
  }

  // Clear sorted set so the final frame shows all nodes as active
  sorted.clear();

  // bs.done
  push({
    kind: "done",
    codeToken: "bs.done",
    narrationToken: "bs.done",
    highlight: Array.from({ length: n }, (_, i) => i),
    meta: { n },
  });

  return frames;
}
