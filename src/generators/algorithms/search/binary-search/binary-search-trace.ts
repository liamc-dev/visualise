import type {
  TraceFrame,
  TraceNode,
  TraceOverlay,
  TracePointer,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import { makeBinarySearchLayout } from "./binary-search-layout";

function cellId(index: number) {
  return `bin:a:${index}`;
}

export function binarySearchTrace(input: number[]): TraceFrame[] {
  const target = input[0];
  const arr = input.slice(1).sort((a, b) => a - b);
  const n = arr.length;
  const frames: TraceFrame[] = [];
  const layout = makeBinarySearchLayout();
  let stepNo = 0;

  let lo = 0;
  let hi = n - 1;

  const targetExists = arr.includes(target);

  function buildScene(opts: {
    lo: number;
    hi: number;
    toneOverrides?: Record<number, TraceTone>;
    weightOverrides?: Record<number, 0 | 1 | 2 | 3>;
    caption?: { text: string; emphasis: "active" | "soft" | "faint" };
  }): TraceScene {
    const nodes: TraceNode[] = arr.map((value, idx) => {
      const eliminated = idx < opts.lo || idx > opts.hi;
      return {
        id: cellId(idx),
        kind: "cell",
        pos: { x: layout.colOffset + idx, y: layout.arrayY },
        meta: {
          value,
          index: idx,
          ...(eliminated
            ? { emphasis: "soft" as const, tone: "muted" as const, opacityMul: 0.35 }
            : undefined),
          ...(opts.toneOverrides?.[idx] ? { tone: opts.toneOverrides[idx] } : undefined),
          ...(opts.weightOverrides?.[idx] != null ? { weight: opts.weightOverrides[idx] } : undefined),
        },
      };
    });

    const cap = opts.caption ?? {
      text: `target = ${target}`,
      emphasis: targetExists ? "active" as const : "soft" as const,
    };

    const overlays: TraceOverlay[] = [
      {
        id: "bin:target",
        kind: "caption",
        x: (n - 1) / 2,
        y: layout.arrayY - 1.5,
        text: cap.text,
        emphasis: cap.emphasis,
      },
    ];

    return { nodes, overlays };
  }

  function push(args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    toneOverrides?: Record<number, TraceTone>;
    weightOverrides?: Record<number, 0 | 1 | 2 | 3>;
    caption?: { text: string; emphasis: "active" | "soft" | "faint" };
    meta?: Record<string, unknown>;
    lo: number;
    hi: number;
    mid?: number;
  }) {
    const scene = buildScene({
      lo: args.lo,
      hi: args.hi,
      toneOverrides: args.toneOverrides,
      weightOverrides: args.weightOverrides,
      caption: args.caption,
    });
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
      applyPointerMasking(scene.nodes, args.pointers);
    }

    frames.push({
      id: `bin.${args.kind}.${stepNo++}`,
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

  function loHiPointers(l: number, h: number): TracePointer[] {
    if (l === h) {
      return [
        {
          id: "lo",
          label: "lo=hi",
          target: { kind: "node", nodeId: cellId(l) },
          lane: "above",
          color: "var(--color-tn-cyan)",
        },
      ];
    }
    return [
      {
        id: "lo",
        label: "lo",
        target: { kind: "node", nodeId: cellId(l) },
        lane: "above",
        color: "var(--color-tn-cyan)",
      },
      {
        id: "hi",
        label: "hi",
        target: { kind: "node", nodeId: cellId(h) },
        lane: "above",
        color: "var(--color-tn-magenta)",
      },
    ];
  }

  function loHiTones(l: number, h: number): Record<number, TraceTone> {
    if (l === h) return { [l]: "cyan" };
    return { [l]: "cyan", [h]: "magenta" };
  }

  function midPointer(m: number): TracePointer {
    return {
      id: "mid",
      label: "mid",
      target: { kind: "node", nodeId: cellId(m) },
      lane: "below",
      color: "var(--color-tn-warning)",
    };
  }

  // --- bin.init ---
  push({
    kind: "init",
    codeToken: "bin.init",
    narrationToken: "bin.init",
    lo: 0,
    hi: n - 1,
    meta: { n, target },
  });

  // --- main loop ---
  while (lo <= hi) {
    // bin.loop
    push({
      kind: "loop",
      codeToken: "bin.loop",
      narrationToken: "bin.loop",
      pointers: loHiPointers(lo, hi),
      toneOverrides: loHiTones(lo, hi),
      lo,
      hi,
      meta: { lo, hi },
    });

    const mid = Math.floor((lo + hi) / 2);

    // bin.mid
    push({
      kind: "mid",
      codeToken: "bin.mid",
      narrationToken: "bin.mid",
      pointers: [...loHiPointers(lo, hi), midPointer(mid)],
      toneOverrides: { ...loHiTones(lo, hi), [mid]: "warning" },
      lo,
      hi,
      mid,
      meta: { lo, hi, mid, midVal: arr[mid] },
    });

    // bin.compare
    push({
      kind: "compare",
      codeToken: "bin.compare",
      narrationToken: "bin.compare",
      highlight: [mid],
      pointers: [...loHiPointers(lo, hi), midPointer(mid)],
      toneOverrides: { ...loHiTones(lo, hi), [mid]: "warning" },
      lo,
      hi,
      mid,
      meta: { lo, hi, mid, midVal: arr[mid], target, cmp: arr[mid] === target ? "eq" : arr[mid] < target ? "lt" : "gt" },
    });

    if (arr[mid] === target) {
      // bin.found
      push({
        kind: "found",
        codeToken: "bin.found",
        narrationToken: "bin.found",
        highlight: [mid],
        pointers: [midPointer(mid)],
        toneOverrides: { [mid]: "accent" },
        weightOverrides: { [mid]: 1 },
        caption: { text: `target = ${target} — found at [${mid}]`, emphasis: "active" },
        lo: 0,
        hi: n - 1,
        mid,
        meta: { mid, midVal: arr[mid], target },
      });
      return frames;
    } else if (arr[mid] < target) {
      // bin.go_right
      lo = mid + 1;
      push({
        kind: "go_right",
        codeToken: "bin.go_right",
        narrationToken: "bin.go_right",
        pointers: lo <= hi ? loHiPointers(lo, hi) : [],
        toneOverrides: lo <= hi ? loHiTones(lo, hi) : {},
        lo,
        hi,
        meta: { mid, midVal: arr[mid], target, newLo: lo },
      });
    } else {
      // bin.go_left
      hi = mid - 1;
      push({
        kind: "go_left",
        codeToken: "bin.go_left",
        narrationToken: "bin.go_left",
        pointers: lo <= hi ? loHiPointers(lo, hi) : [],
        toneOverrides: lo <= hi ? loHiTones(lo, hi) : {},
        lo,
        hi,
        meta: { mid, midVal: arr[mid], target, newHi: hi },
      });
    }
  }

  // bin.not_found
  push({
    kind: "not_found",
    codeToken: "bin.not_found",
    narrationToken: "bin.not_found",
    caption: { text: `target = ${target} — not found`, emphasis: "faint" },
    lo: 0,
    hi: -1,
    meta: { target },
  });

  return frames;
}
