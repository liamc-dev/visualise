import type {
  TraceFrame,
  TraceNode,
  TraceOverlay,
  TracePointer,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import { makeLinearSearchLayout } from "./linear-search-layout";

function cellId(index: number) {
  return `lin:a:${index}`;
}

export function linearSearchTrace(input: number[]): TraceFrame[] {
  const target = input[0];
  const arr = input.slice(1);
  const n = arr.length;
  const frames: TraceFrame[] = [];
  const layout = makeLinearSearchLayout();
  let stepNo = 0;

  const targetExists = arr.includes(target);

  function buildScene(opts: {
    checkedUpTo: number;
    toneOverrides?: Record<number, TraceTone>;
    weightOverrides?: Record<number, 0 | 1 | 2 | 3>;
    caption?: { text: string; emphasis: "active" | "soft" | "faint" };
  }): TraceScene {
    const nodes: TraceNode[] = arr.map((value, idx) => {
      const checked = idx < opts.checkedUpTo;
      return {
        id: cellId(idx),
        kind: "cell",
        pos: { x: layout.colOffset + idx, y: layout.arrayY },
        meta: {
          value,
          index: idx,
          ...(checked
            ? { emphasis: "soft" as const, tone: "muted" as const, opacityMul: 0.45 }
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
        id: "lin:target",
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
    pointers?: TracePointer[];
    toneOverrides?: Record<number, TraceTone>;
    weightOverrides?: Record<number, 0 | 1 | 2 | 3>;
    caption?: { text: string; emphasis: "active" | "soft" | "faint" };
    meta?: Record<string, unknown>;
    checkedUpTo: number;
  }) {
    const scene = buildScene({
      checkedUpTo: args.checkedUpTo,
      toneOverrides: args.toneOverrides,
      weightOverrides: args.weightOverrides,
      caption: args.caption,
    });
    const focusNodes: string[] = [];

    if (args.pointers?.length) {
      for (const p of args.pointers) {
        if (p.target.kind === "node") focusNodes.push(p.target.nodeId);
      }
      applyPointerMasking(scene.nodes, args.pointers);
    }

    frames.push({
      id: `lin.${args.kind}.${stepNo++}`,
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

  function iPointer(idx: number): TracePointer {
    return {
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: cellId(idx) },
      lane: "above",
      color: "var(--color-tn-cyan)",
    };
  }

  // --- lin.init ---
  push({
    kind: "init",
    codeToken: "lin.init",
    narrationToken: "lin.init",
    checkedUpTo: 0,
    meta: { n, target },
  });

  // --- main loop ---
  for (let i = 0; i < n; i++) {
    // lin.check — compare a[i] with target
    push({
      kind: "check",
      codeToken: "lin.check",
      narrationToken: "lin.check",
      pointers: [iPointer(i)],
      toneOverrides: { [i]: "cyan" },
      checkedUpTo: i,
      meta: { i, value: arr[i], target },
    });

    if (arr[i] === target) {
      // lin.found
      push({
        kind: "found",
        codeToken: "lin.found",
        narrationToken: "lin.found",
        pointers: [iPointer(i)],
        toneOverrides: { [i]: "accent" },
        weightOverrides: { [i]: 1 },
        caption: { text: `target = ${target} — found at [${i}]`, emphasis: "active" },
        checkedUpTo: i,
        meta: { i, value: arr[i], target },
      });
      return frames;
    }

    // lin.next — no match, advance
    push({
      kind: "next",
      codeToken: "lin.next",
      narrationToken: "lin.next",
      pointers: i + 1 < n ? [iPointer(i + 1)] : [],
      toneOverrides: i + 1 < n ? { [i + 1]: "cyan" } : {},
      checkedUpTo: i + 1,
      meta: { i, value: arr[i], target },
    });
  }

  // lin.not_found
  push({
    kind: "not_found",
    codeToken: "lin.not_found",
    narrationToken: "lin.not_found",
    caption: { text: `target = ${target} — not found`, emphasis: "faint" },
    checkedUpTo: n,
    meta: { target },
  });

  return frames;
}
