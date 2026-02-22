// src/generators/algorithms/sorting/counting-sort/counting-sort-trace.ts
import type {
  TraceFrame,
  TraceNode,
  TraceOverlay,
  TracePointer,
  TraceTone,
} from "../../../../types/trace-types";
import {
  CS_INPUT_Y,
  CS_COUNT_Y,
  csCountChunkWidth,
  csCountRowCount,
  csOutputY,
} from "./counting-sort-layout";

export function countingSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: TraceFrame[] = [];
  let stepNo = 0;

  if (n === 0) return frames;

  const maxVal = Math.max(...arr);
  const k = maxVal + 1; // count array size 0..maxVal

  // Count array wrapping
  const chunkW = csCountChunkWidth(n);
  const countRows = csCountRowCount(k, chunkW);
  const outputY = csOutputY(countRows);

  // -----------------------------------------------------------------------
  // Per-cell tone/weight overrides applied during buildScene
  // -----------------------------------------------------------------------
  type CellOverride = { tone: TraceTone; weight: 0 | 1 | 2 };

  // -----------------------------------------------------------------------
  // Scene builder
  // -----------------------------------------------------------------------
  function buildScene(args: {
    arr: number[];
    count: number[];
    output: number[];
    outputUsed: boolean[];
    showCount: boolean;
    showOutput: boolean;
    countOverrides?: Record<number, CellOverride>;
    outputOverrides?: Record<number, CellOverride>;
  }): { nodes: TraceNode[]; overlays: TraceOverlay[] } {
    const {
      arr: a, count, output, outputUsed,
      showCount, showOutput,
      countOverrides, outputOverrides,
    } = args;
    const nodes: TraceNode[] = [];
    const overlays: TraceOverlay[] = [];

    // Row labels
    overlays.push({
      kind: "text",
      id: "lbl:input",
      x: -1.5,
      y: CS_INPUT_Y,
      text: "input",
      emphasis: "faint",
    });

    // Input row
    for (let i = 0; i < a.length; i++) {
      nodes.push({
        id: `cs:a:${i}`,
        kind: "cell",
        pos: { x: i, y: CS_INPUT_Y },
        meta: { value: a[i], layer: "input", index: i },
      });
    }

    // Count rows (wrapped)
    if (showCount) {
      overlays.push({
        kind: "text",
        id: "lbl:count",
        x: -1.5,
        y: CS_COUNT_Y,
        text: "count",
        emphasis: "faint",
      });
      // k annotation above the count row
      overlays.push({
        kind: "caption",
        id: "lbl:k",
        x: 0,
        y: CS_COUNT_Y - 0.55,
        text: `k = ${k}`,
        emphasis: "soft",
      });
      for (let v = 0; v < count.length; v++) {
        const row = Math.floor(v / chunkW);
        const col = v % chunkW;
        const ov = countOverrides?.[v];
        nodes.push({
          id: `cs:c:${v}`,
          kind: "cell",
          pos: { x: col, y: CS_COUNT_Y + row },
          meta: {
            value: count[v],
            tone: ov?.tone ?? ("info" as const),
            weight: ov?.weight ?? (0 as const),
            layer: "count",
            index: v,
          },
        });
      }
    }

    // Output row
    if (showOutput) {
      overlays.push({
        kind: "text",
        id: "lbl:output",
        x: -1.5,
        y: outputY,
        text: "output",
        emphasis: "faint",
      });
      for (let i = 0; i < a.length; i++) {
        const ov = outputOverrides?.[i];
        nodes.push({
          id: `cs:o:${i}`,
          kind: outputUsed[i] ? "cell" : "temp",
          pos: { x: i, y: outputY },
          meta: {
            value: outputUsed[i] ? output[i] : "",
            layer: "output",
            index: i,
            tone: ov?.tone ?? ("neutral" as const),
            weight: ov?.weight ?? (0 as const),
          },
        });
      }
    }

    return { nodes, overlays };
  }

  // -----------------------------------------------------------------------
  // Push helper
  // -----------------------------------------------------------------------
  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    arr: number[];
    count: number[];
    output: number[];
    outputUsed: boolean[];
    showCount: boolean;
    showOutput: boolean;
    countOverrides?: Record<number, CellOverride>;
    outputOverrides?: Record<number, CellOverride>;
    focusNodes?: string[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) {
    const { nodes, overlays } = buildScene({
      arr: args.arr,
      count: args.count,
      output: args.output,
      outputUsed: args.outputUsed,
      showCount: args.showCount,
      showOutput: args.showOutput,
      countOverrides: args.countOverrides,
      outputOverrides: args.outputOverrides,
    });

    // Hide values on cells physically behind pointer badges (DFS pattern).
    if (args.pointers?.length) {
      const posMap = new Map<string, TraceNode>();
      for (const nd of nodes) {
        posMap.set(`${nd.pos.x},${nd.pos.y}`, nd);
      }
      for (const p of args.pointers) {
        if (p.target.kind !== "node") continue;
        const target = nodes.find((nd) => nd.id === p.target.nodeId);
        if (!target) continue;
        const lane = p.lane ?? "above";
        let maskedKey: string | undefined;
        if (lane === "above") maskedKey = `${target.pos.x},${target.pos.y - 1}`;
        else if (lane === "below") maskedKey = `${target.pos.x},${target.pos.y + 1}`;
        else if (lane === "left") maskedKey = `${target.pos.x - 1},${target.pos.y}`;
        else if (lane === "right") maskedKey = `${target.pos.x + 1},${target.pos.y}`;
        if (maskedKey) {
          const masked = posMap.get(maskedKey);
          if (masked?.meta) {
            masked.meta = { ...masked.meta, value: "" };
          }
        }
      }
    }

    frames.push({
      id: `cs.${args.kind}.${stepNo++}`,
      kind: args.kind,
      codeToken: args.codeToken,
      narrationToken: args.narrationToken,
      scene: { nodes, overlays },
      focus: {
        nodes: args.focusNodes?.length ? args.focusNodes : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  }

  // -----------------------------------------------------------------------
  // Pointer helpers
  // -----------------------------------------------------------------------
  function iPointer(idx: number): TracePointer {
    return {
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: `cs:a:${idx}` },
      lane: "above",
      color: "var(--color-tn-cyan)",
    };
  }

  // -----------------------------------------------------------------------
  // State holders
  // -----------------------------------------------------------------------
  const count = new Array(k).fill(0);
  const output = new Array(n).fill(0);
  const outputUsed = new Array(n).fill(false);

  // Init frame
  push({
    kind: "init",
    codeToken: "cs.init",
    narrationToken: "cs.init",
    arr,
    count,
    output,
    outputUsed,
    showCount: false,
    showOutput: false,
    focusNodes: arr.map((_, i) => `cs:a:${i}`),
    meta: { maxVal, k },
  });

  // -----------------------------------------------------------------------
  // 1. Count occurrences
  // -----------------------------------------------------------------------
  push({
    kind: "count_init",
    codeToken: "cs.count_init",
    narrationToken: "cs.count_init",
    arr,
    count,
    output,
    outputUsed,
    showCount: true,
    showOutput: false,
    meta: { k },
  });

  for (let i = 0; i < n; i++) {
    const val = arr[i];

    // Frame 1: scan — highlight input element, tint destination count cell
    push({
      kind: "scan",
      codeToken: "cs.scan",
      narrationToken: "cs.scan",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: false,
      // warning tone on the count cell we're about to touch
      countOverrides: { [val]: { tone: "warning", weight: 0 } },
      focusNodes: [`cs:a:${i}`, `cs:c:${val}`],
      pointers: [iPointer(i)],
      meta: { i, value: val },
    });

    // Mutate
    count[val]++;

    // Frame 2: count — count cell lights up with accent after increment
    push({
      kind: "count",
      codeToken: "cs.count",
      narrationToken: "cs.count",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: false,
      countOverrides: { [val]: { tone: "accent", weight: 1 } },
      focusNodes: [`cs:a:${i}`, `cs:c:${val}`],
      pointers: [iPointer(i)],
      meta: { i, value: val, countVal: count[val] },
    });
  }

  // -----------------------------------------------------------------------
  // 2. Prefix sums
  // -----------------------------------------------------------------------
  for (let i = 1; i < k; i++) {
    const prevVal = count[i - 1];
    const curVal = count[i];

    const prefixPtr: TracePointer = {
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: `cs:c:${i}` },
      lane: "above",
      color: "var(--color-tn-cyan)",
    };

    // Frame 1: prefix_read — highlight source (i-1, warning) and target (i)
    push({
      kind: "prefix_read",
      codeToken: "cs.prefix_read",
      narrationToken: "cs.prefix_read",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: false,
      countOverrides: {
        [i - 1]: { tone: "warning", weight: 1 },
      },
      focusNodes: [`cs:c:${i - 1}`, `cs:c:${i}`],
      pointers: [prefixPtr],
      meta: { prefixIdx: i, prevVal, curVal },
    });

    // Mutate
    count[i] += count[i - 1];

    // Frame 2: prefix — result cell lights up with accent
    push({
      kind: "prefix",
      codeToken: "cs.prefix",
      narrationToken: "cs.prefix",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: false,
      countOverrides: {
        [i - 1]: { tone: "warning", weight: 0 },
        [i]: { tone: "accent", weight: 1 },
      },
      focusNodes: [`cs:c:${i - 1}`, `cs:c:${i}`],
      pointers: [prefixPtr],
      meta: { prefixIdx: i, countVal: count[i] },
    });
  }

  // -----------------------------------------------------------------------
  // 3. Place elements (right-to-left for stability)
  // -----------------------------------------------------------------------
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const pos = count[val] - 1;

    // Frame 1: read — highlight input + count cell (look up position)
    push({
      kind: "read",
      codeToken: "cs.read",
      narrationToken: "cs.read",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: true,
      countOverrides: { [val]: { tone: "warning", weight: 1 } },
      focusNodes: [`cs:a:${i}`, `cs:c:${val}`],
      pointers: [iPointer(i)],
      meta: { i, value: val, pos, countVal: count[val] },
    });

    // Mutate
    output[pos] = val;
    outputUsed[pos] = true;
    count[val]--;

    // Frame 2: place — output cell pops with accent, count decremented
    push({
      kind: "place",
      codeToken: "cs.place",
      narrationToken: "cs.place",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: true,
      outputOverrides: { [pos]: { tone: "accent", weight: 1 } },
      focusNodes: [`cs:a:${i}`, `cs:o:${pos}`],
      pointers: [
        iPointer(i),
        {
          id: "pos",
          label: `${pos}`,
          target: { kind: "node", nodeId: `cs:o:${pos}` },
          lane: "below",
          color: "var(--color-tn-accent)",
        },
      ],
      meta: { i, value: val, pos, countVal: count[val] },
    });
  }

  // -----------------------------------------------------------------------
  // 4. Copy back
  // -----------------------------------------------------------------------
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }

  push({
    kind: "copy_back",
    codeToken: "cs.copy_back",
    narrationToken: "cs.copy_back",
    arr,
    count,
    output,
    outputUsed,
    showCount: false,
    showOutput: false,
    focusNodes: arr.map((_, i) => `cs:a:${i}`),
  });

  // Done
  push({
    kind: "done",
    codeToken: "cs.done",
    narrationToken: "cs.done",
    arr,
    count,
    output,
    outputUsed,
    showCount: false,
    showOutput: false,
    focusNodes: arr.map((_, i) => `cs:a:${i}`),
    meta: { sorted: true },
  });

  return frames;
}
