// utils/styleUtil.ts

// -----------------------------
// 🎨 TOKYO NIGHT COLOR PALETTE (viz-specific)
// -----------------------------
const BASE_STALE = "#16161e";       // tn-surface, older / background nodes
const NEUTRAL = "#3b4261";          // tn-accentSoft, neutral active node
const MID_COLOR = "#7dcfff";        // tn-cyan, pivot/mid
const ACTIVE_BLUE = "#7aa2f7";      // tn-accent, active range (current work)
const COMPLETED_GREEN = "#9ece6a";  // tn-success, subtle for completed segments

// Highlight base colors (RGB for RGBA math)
const HIGHLIGHT_BASE = { r: 125, g: 207, b: 255 };   // tn-cyan
const TRAIL_BASE = { r: 169, g: 177, b: 214 };       // tn-muted (#a9b1d6)
const WRITEBACK_BASE = { r: 187, g: 154, b: 247 };   // tn-magenta (pink)

// Shadows
const MID_SHADOW = "0 0 14px rgba(125, 207, 255, 0.25)";      // cyan glow
const ACTIVE_SHADOW = "0 0 14px rgba(122, 162, 247, 0.26)";   // blue glow
const WRITEBACK_SHADOW = "0 0 16px rgba(187, 154, 247, 0.25)"; // pink glow


// -----------------------------
// 🌊 DEPTH SCALING
// -----------------------------
export function getDepthHighlightStrength(depth: number): number {
  const min = 0.22;
  const max = 1.0;
  const clampedDepth = Math.max(0, Math.min(depth, 5));

  const t = clampedDepth / 5;             // 0 at root, 1 deeper
  const value = max * (1 - t) + min * t;  // lerp(max → min)
  return value;
}

// -----------------------------
// 🔹 HELPERS — dynamic RGBA
// -----------------------------
function rgba(base: { r: number; g: number; b: number }, alpha: number): string {
  return `rgba(${base.r}, ${base.g}, ${base.b}, ${alpha})`;
}

// -----------------------------
// 🔥 OPACITY
// -----------------------------
export function getOpacity(isLatest: boolean, isActiveRange: boolean): number {
  if (isLatest) {
    return isActiveRange ? 1 : 0.85;
  }
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
  // Highlighted cells (primary action)
  if (isHighlight) {
    const s = getDepthHighlightStrength(depth);
    return rgba(HIGHLIGHT_BASE, 0.65 * s); // bright cyan scaled by depth
  }

  // Trail from previous highlighted frame
  if (isTrail) {
    const s = getDepthHighlightStrength(depth);
    return rgba(TRAIL_BASE, 0.28 * s); // muted periwinkle fade
  }

  // Write-back step overall tint (subtle magenta wash on current frame)
  if (isWriteStep) {
    const s = getDepthHighlightStrength(depth);
    return rgba(WRITEBACK_BASE, 0.4 * s); // visible pink but not nuclear
  }

  // Non-latest nodes = "completed" segments
  if (!isLatest) {
    return COMPLETED_GREEN + "33"; // hex with ~0.2 alpha (#9ece6a33)
  }

  // Current frame nodes
  if (isMid) return MID_COLOR;           // cyan pivot
  if (isActiveRange) return ACTIVE_BLUE; // blue active range band

  // Neutral current nodes
  return NEUTRAL;
}

// -----------------------------
// 🔥 SCALE (DEPTH-AWARE ONLY FOR HIGHLIGHT)
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
    return 0.95 + s * 0.05; // small pop near root, smaller deeper
  }

  if (isTrail) return 0.92;
  if (isMid) return 1.0;
  if (isActiveRange) return 1.0;

  return isLatest ? 1.0 : 0.95;
}

// -----------------------------
// 🌟 BOX SHADOW (DEPTH-AWARE HIGHLIGHT)
// -----------------------------
export function getBoxShadow(
  isHighlight: boolean,
  isTrail: boolean,
  isMid: boolean,
  isActiveRange: boolean,
  isWriteStep: boolean,
  depth: number,
): string {
  if (isHighlight) {
    const s = getDepthHighlightStrength(depth);
    const glow = 10 + s * 16;
    return `0 0 ${glow}px rgba(125, 207, 255, ${0.28 * s})`;
  }

  if (isTrail) {
    const s = getDepthHighlightStrength(depth);
    return `0 0 ${8 + 8 * s}px rgba(169,177,214, ${0.2 * s})`;
  }

  if (isMid) return MID_SHADOW;
  if (isActiveRange) return ACTIVE_SHADOW;

  if (isWriteStep) {
    return WRITEBACK_SHADOW; // pink aura during write-back frames
  }

  // Completed segments: subtle green aura
  return "0 0 10px rgba(158, 206, 106, 0.18)";
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
