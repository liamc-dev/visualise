// utils/styleUtil.ts

const STALE = "var(--color-tn-surface)";       // older/completed nodes
const NEUTRAL = "var(--color-tn-accentSoft)";  // neutral active node
const MID = "var(--color-tn-cyan)";            // pivot/mid
const ACTIVE = "var(--color-tn-accent)";       // active range
const COMPLETED = "var(--color-tn-success)";   // completed segments
const HIGHLIGHT = "var(--color-tn-cyan)";      // highlight
const TRAIL = "var(--color-tn-muted)";         // trail
const WRITEBACK = "var(--color-tn-magenta)";   // writeback tint

function mix(color: string, pct: number) {
  // pct = 0..100, more pct = more color, less = more transparent
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export type VisualFlags = {
  latest?: boolean;
  active?: boolean;

  highlight?: boolean;
  trail?: boolean;
  mid?: boolean;
  write?: boolean;

  depth?: number;
};

function strength(depth = 0): number {
  const min = 0.22;
  const max = 1.0;
  const clampedDepth = Math.max(0, Math.min(depth, 5));
  const t = clampedDepth / 5; // 0..1
  return max * (1 - t) + min * t;
}



export function opacity(v: VisualFlags): number {
  const isLatest = !!v.latest;
  const isActive = !!v.active;

  if (isLatest) return isActive ? 1 : 0.85;
  return 0.55;
}

export function backgroundColor(v: VisualFlags): string {
  const s = strength(v.depth);

  if (v.highlight) return mix(HIGHLIGHT, Math.round(65 * s));
  if (v.trail) return mix(TRAIL, Math.round(28 * s));
  if (v.write) return mix(WRITEBACK, Math.round(40 * s));

  if (!v.latest) return mix(COMPLETED, 20);

  if (v.mid) return MID;
  if (v.active) return ACTIVE;

  return NEUTRAL;
}

export function scale(v: VisualFlags): number {
  const s = strength(v.depth);

  if (v.highlight) return 0.95 + s * 0.05;
  if (v.trail) return 0.92;
  if (v.mid) return 1.0;
  if (v.active) return 1.0;

  return v.latest ? 1.0 : 0.95;
}

export function boxShadow(v: VisualFlags): string {
  const s = strength(v.depth);

  if (v.highlight) {
    const glow = 10 + s * 16;
    return `0 0 ${glow}px ${mix(HIGHLIGHT, Math.round(28 * s))}`;
  }

  if (v.trail) {
    const glow = 8 + 8 * s;
    return `0 0 ${glow}px ${mix(TRAIL, Math.round(20 * s))}`;
  }

  if (v.mid) return `0 0 14px ${mix(MID, 25)}`;
  if (v.active) return `0 0 14px ${mix(ACTIVE, 26)}`;
  if (v.write) return `0 0 16px ${mix(WRITEBACK, 25)}`;

  return `0 0 10px ${mix(COMPLETED, 18)}`;
}

export function lerpColor(c1: string, c2: string, t: number) {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);

  const r1 = (a >> 16) & 0xff;
  const g1 = (a >> 8) & 0xff;
  const b1 = a & 0xff;

  const r2 = (b >> 16) & 0xff;
  const g2 = (b >> 8) & 0xff;
  const b2 = b & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b3 = Math.round(b1 + (b2 - b1) * t);

  return `rgba(${r}, ${g}, ${b3}, 0.27)`;
}
