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

// -----------------------------
// 🌊 DEPTH SCALING
// -----------------------------
export function getDepthHighlightStrength(depth: number): number {
  const min = 0.22;
  const max = 1.0;
  const clampedDepth = Math.max(0, Math.min(depth, 5));
  const t = clampedDepth / 5;             // 0 at root, 1 deeper
  return max * (1 - t) + min * t;         // lerp(max → min)
}

// -----------------------------
// 🔥 OPACITY
// -----------------------------
export function getOpacity(isLatest: boolean, isActiveRange: boolean): number {
  if (isLatest) return isActiveRange ? 1 : 0.85;
  return 0.55;
}

// -----------------------------
// 🎨 BACKGROUND COLOR (DEPTH-AWARE + STATEFUL)
// -----------------------------
export function getBackgroundColor(
  isLatest: boolean,
  isHighlight: boolean,
  isTrail: boolean,
  isMid: boolean,
  isActiveRange: boolean,
  isWriteStep: boolean,
  depth: number,
): string {
  const s = getDepthHighlightStrength(depth);

  if (isHighlight) {
    // was rgba cyan; now theme cyan w/ depth-scaled strength
    return mix(HIGHLIGHT, Math.round(65 * s));
  }

  if (isTrail) {
    return mix(TRAIL, Math.round(28 * s));
  }

  if (isWriteStep) {
    return mix(WRITEBACK, Math.round(40 * s));
  }

  if (!isLatest) {
    // completed segments subtle tint
    return mix(COMPLETED, 20);
  }

  if (isMid) return MID;
  if (isActiveRange) return ACTIVE;

  return NEUTRAL;
}

// -----------------------------
// 🔥 SCALE
// -----------------------------
export function getScale(
  isLatest: boolean,
  isHighlight: boolean,
  isTrail: boolean,
  isMid: boolean,
  isActiveRange: boolean,
  depth: number,
): number {
  if (isHighlight) {
    const s = getDepthHighlightStrength(depth);
    return 0.95 + s * 0.05;
  }
  if (isTrail) return 0.92;
  if (isMid) return 1.0;
  if (isActiveRange) return 1.0;
  return isLatest ? 1.0 : 0.95;
}

// -----------------------------
// 🌟 BOX SHADOW (theme-dynamic)
// -----------------------------
export function getBoxShadow(
  isHighlight: boolean,
  isTrail: boolean,
  isMid: boolean,
  isActiveRange: boolean,
  isWriteStep: boolean,
  depth: number,
): string {
  const s = getDepthHighlightStrength(depth);

  if (isHighlight) {
    const glow = 10 + s * 16;
    // use theme cyan + alpha via color-mix
    return `0 0 ${glow}px ${mix(HIGHLIGHT, Math.round(28 * s * 100) / 100)}`;
  }

  if (isTrail) {
    const glow = 8 + 8 * s;
    return `0 0 ${glow}px ${mix(TRAIL, Math.round(20 * s))}`;
  }

  if (isMid) return `0 0 14px ${mix(MID, 25)}`;
  if (isActiveRange) return `0 0 14px ${mix(ACTIVE, 26)}`;

  if (isWriteStep) return `0 0 16px ${mix(WRITEBACK, 25)}`;

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
