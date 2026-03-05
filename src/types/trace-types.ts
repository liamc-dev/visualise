// src/trace/trace-types.ts

export type TraceEmphasis = "active" | "soft" | "faint";

export type TraceFrame = {
  id: string;
  kind: string;
  codeToken?: string;
  narrationToken?: string;
  scene: TraceScene;
  focus?: TraceFocus;
  meta?: Record<string, unknown>;
};

export type TraceScene = {
  nodes: TraceNode[];
  edges?: TraceEdge[];
  overlays?: TraceOverlay[];
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
};

export type TraceTone = "neutral" | "accent" | "info" | "warning" | "danger" | "muted" | "cyan" | "magenta";

export type TraceNode = {
  id: string;
  kind: string; // "cell" | "temp" | "lb" | "server" | ...
  pos: { x: number; y: number; depth?: number };
  meta?: {
    value?: string | number;

    // styling intent (generic, renderer-safe)
    emphasis?: TraceEmphasis;     // active / soft / faint
    tone?: TraceTone;             // neutral/accent/warning/etc
    weight?: 0 | 1 | 2 | 3;       // 0=normal, 1=raised, 2=strong, 3=max
    opacity?: number;             // hard override
    opacityMul?: number;          // multiplier
    widthPx?: number;
    heightPx?: number;

    // algorithm-specific stuff still allowed (renderer should NOT branch on these)
    [k: string]: unknown;
  };
};

export type TraceEdge = {
  id: string;
  from: string;
  to: string;
  kind?: string;
  meta?: Record<string, unknown>;
};

export type TraceOverlay =
  | { kind: "vline"; id: string; x: number; y1: number; y2: number; emphasis?: TraceEmphasis }
  | { kind: "text"; id: string; x: number; y: number; text: string; emphasis?: TraceEmphasis }
  | { kind: "band"; id: string; y: number; height: number; emphasis?: TraceEmphasis }
  | { kind: "caption", id: string, x: number, y: number, text: string, emphasis?: TraceEmphasis, align?: "center" | "right" | "below", opacity?: number, color?: string }
  | { kind: "linechart"; id: string; x: number; y: number; width: number; height: number; points: { epoch: number; value: number }[]; yLabel?: string };

export type TraceFocus = {
  nodes?: string[];
  edges?: string[];
  pointers?: TracePointer[];
};

export type TraceAnchor = "point" | "center" | "top" | "bottom" | "left" | "right";

export type TracePointerTarget =
  | { kind: "node"; nodeId: string; anchor?: TraceAnchor }
  | { kind: "pos"; x: number; y: number; anchor?: TraceAnchor };

export type TracePointerLane = "above" | "on" | "below" | "left" | "right";

export type TracePointer = {
  id: string;
  label?: string;
  target: TracePointerTarget;
  lane?: TracePointerLane;
  color?: string;
};
