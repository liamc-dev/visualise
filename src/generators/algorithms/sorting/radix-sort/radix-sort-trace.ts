// src/generators/algorithms/sorting/radix-sort/radix-sort-trace.ts
import type {
  TraceFrame,
  TraceNode,
  TraceOverlay,
  TracePointer,
  TraceTone,
} from "../../../../types/trace-types";
import { RX_INPUT_Y, RX_COUNT_Y, RX_OUTPUT_Y } from "./radix-sort-layout";

export function radixSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: TraceFrame[] = [];
  let stepNo = 0;

  if (n === 0) return frames;

  const maxVal = Math.max(...arr);

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
    touchedCounts?: ReadonlySet<number>;
  }): { nodes: TraceNode[]; overlays: TraceOverlay[] } {
    const {
      arr: a, count, output, outputUsed,
      showCount, showOutput,
      countOverrides, outputOverrides,
      touchedCounts,
    } = args;
    const nodes: TraceNode[] = [];
    const overlays: TraceOverlay[] = [];

    // Row labels
    overlays.push({
      kind: "text",
      id: "lbl:input",
      x: -1.5,
      y: RX_INPUT_Y,
      text: "input",
      emphasis: "faint",
    });

    // Input row
    for (let i = 0; i < a.length; i++) {
      nodes.push({
        id: `rx:a:${i}`,
        kind: "cell",
        pos: { x: i, y: RX_INPUT_Y },
        meta: { value: a[i], layer: "input", index: i },
      });
    }

    // Count row
    if (showCount) {
      overlays.push({
        kind: "text",
        id: "lbl:count",
        x: -1.5,
        y: RX_COUNT_Y,
        text: "count",
        emphasis: "faint",
      });
      for (let d = 0; d < 10; d++) {
        const ov = countOverrides?.[d];
        const dimmed = !ov && touchedCounts && !touchedCounts.has(d);
        nodes.push({
          id: `rx:c:${d}`,
          kind: "cell",
          pos: { x: d, y: RX_COUNT_Y },
          meta: {
            value: count[d],
            tone: ov?.tone ?? ("neutral" as const),
            weight: ov?.weight ?? (0 as const),
            ...(dimmed ? { emphasis: "faint" as const } : undefined),
            layer: "count",
            index: d,
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
        y: RX_OUTPUT_Y,
        text: "output",
        emphasis: "faint",
      });
      for (let i = 0; i < a.length; i++) {
        const ov = outputOverrides?.[i];
        nodes.push({
          id: `rx:o:${i}`,
          kind: outputUsed[i] ? "cell" : "temp",
          pos: { x: i, y: RX_OUTPUT_Y },
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
    touchedCounts?: ReadonlySet<number>;
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
      touchedCounts: args.touchedCounts,
    });

    // Hide values on cells physically behind pointer badges.
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
      id: `rx.${args.kind}.${stepNo++}`,
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
  // Common state holders (reused across passes)
  // -----------------------------------------------------------------------
  let count = new Array(10).fill(0);
  let output = new Array(n).fill(0);
  let outputUsed = new Array(n).fill(false);
  let touchedCounts = new Set<number>();

  // Init frame
  push({
    kind: "init",
    codeToken: "rx.init",
    narrationToken: "rx.init",
    arr,
    count,
    output,
    outputUsed,
    showCount: false,
    showOutput: false,
    focusNodes: arr.map((_, i) => `rx:a:${i}`),
    meta: { maxVal },
  });

  // -----------------------------------------------------------------------
  // LSD Radix Sort
  // -----------------------------------------------------------------------
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    count = new Array(10).fill(0);
    output = new Array(n).fill(0);
    outputUsed = new Array(n).fill(false);
    touchedCounts = new Set<number>();

    // Digit start
    push({
      kind: "digit_start",
      codeToken: "rx.digit_start",
      narrationToken: "rx.digit_start",
      arr,
      count,
      output,
      outputUsed,
      showCount: true,
      showOutput: false,
      touchedCounts,
      meta: { exp },
    });

    // Counting phase
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;

      // Beat 1: extract — read input, highlight target count cell (cyan)
      push({
        kind: "extract",
        codeToken: "rx.extract",
        narrationToken: "rx.extract",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: false,
        countOverrides: { [digit]: { tone: "cyan", weight: 0 } },
        touchedCounts,
        focusNodes: [`rx:a:${i}`, `rx:c:${digit}`],
        pointers: [
          {
            id: "i",
            label: "i",
            target: { kind: "node", nodeId: `rx:a:${i}` },
            lane: "above",
            color: "var(--color-tn-cyan)",
          },
        ],
        meta: { exp, i, value: arr[i], digit },
      });

      count[digit]++;
      touchedCounts.add(digit);

      // Beat 2: count — count cell lights up magenta after increment
      push({
        kind: "count",
        codeToken: "rx.count",
        narrationToken: "rx.count",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: false,
        countOverrides: { [digit]: { tone: "magenta", weight: 1 } },
        touchedCounts,
        focusNodes: [`rx:a:${i}`, `rx:c:${digit}`],
        pointers: [
          {
            id: "i",
            label: "i",
            target: { kind: "node", nodeId: `rx:a:${i}` },
            lane: "above",
            color: "var(--color-tn-cyan)",
          },
        ],
        meta: { exp, i, value: arr[i], digit, countVal: count[digit] },
      });
    }

    // Prefix sum phase
    for (let i = 1; i < 10; i++) {
      const prevVal = count[i - 1];

      // Beat 1: read source cell (cyan)
      push({
        kind: "prefix",
        codeToken: "rx.prefix",
        narrationToken: "rx.prefix",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: false,
        countOverrides: { [i - 1]: { tone: "cyan", weight: 1 } },
        touchedCounts,
        focusNodes: [`rx:c:${i - 1}`, `rx:c:${i}`],
        meta: { exp, prefixIdx: i, prevVal, countVal: count[i] },
      });

      count[i] += count[i - 1];
      touchedCounts.add(i);

      // Beat 2: result cell lights up magenta
      push({
        kind: "prefix",
        codeToken: "rx.prefix",
        narrationToken: "rx.prefix",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: false,
        countOverrides: {
          [i - 1]: { tone: "cyan", weight: 0 },
          [i]: { tone: "magenta", weight: 1 },
        },
        touchedCounts,
        focusNodes: [`rx:c:${i - 1}`, `rx:c:${i}`],
        meta: { exp, prefixIdx: i, countVal: count[i] },
      });
    }

    // Placement phase (right-to-left for stability)
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const pos = count[digit] - 1;

      // Beat 1: read — look up position from count cell (cyan)
      push({
        kind: "place",
        codeToken: "rx.place",
        narrationToken: "rx.place",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: true,
        countOverrides: { [digit]: { tone: "cyan", weight: 1 } },
        touchedCounts,
        focusNodes: [`rx:a:${i}`, `rx:c:${digit}`],
        pointers: [
          {
            id: "i",
            label: "i",
            target: { kind: "node", nodeId: `rx:a:${i}` },
            lane: "above",
            color: "var(--color-tn-cyan)",
          },
        ],
        meta: { exp, i, value: arr[i], digit, pos, countVal: count[digit] },
      });

      output[pos] = arr[i];
      outputUsed[pos] = true;
      count[digit]--;

      // Beat 2: place — output cell lights up magenta
      push({
        kind: "place",
        codeToken: "rx.place",
        narrationToken: "rx.place",
        arr,
        count,
        output,
        outputUsed,
        showCount: true,
        showOutput: true,
        outputOverrides: { [pos]: { tone: "magenta", weight: 1 } },
        touchedCounts,
        focusNodes: [`rx:a:${i}`, `rx:o:${pos}`],
        pointers: [
          {
            id: "i",
            label: "i",
            target: { kind: "node", nodeId: `rx:a:${i}` },
            lane: "above",
            color: "var(--color-tn-cyan)",
          },
          {
            id: "pos",
            label: `${pos}`,
            target: { kind: "node", nodeId: `rx:o:${pos}` },
            lane: "below",
            color: "var(--color-tn-magenta)",
          },
        ],
        meta: { exp, i, value: arr[i], digit, pos, countVal: count[digit] },
      });
    }

    // Copy back
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
    }

    push({
      kind: "copy_back",
      codeToken: "rx.copy_back",
      narrationToken: "rx.copy_back",
      arr,
      count,
      output,
      outputUsed,
      showCount: false,
      showOutput: false,
      focusNodes: arr.map((_, i) => `rx:a:${i}`),
      meta: { exp },
    });

    // Pass done
    push({
      kind: "pass_done",
      codeToken: "rx.copy_back",
      narrationToken: "rx.pass_done",
      arr,
      count,
      output,
      outputUsed,
      showCount: false,
      showOutput: false,
      focusNodes: arr.map((_, i) => `rx:a:${i}`),
      meta: { exp },
    });
  }

  // Done
  push({
    kind: "done",
    codeToken: "rx.done",
    narrationToken: "rx.done",
    arr,
    count,
    output,
    outputUsed,
    showCount: false,
    showOutput: false,
    focusNodes: arr.map((_, i) => `rx:a:${i}`),
    meta: { sorted: true },
  });

  return frames;
}
