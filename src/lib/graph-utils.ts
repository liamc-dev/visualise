// src/lib/graph-utils.ts

export const NODES = ["A", "B", "C", "D", "E", "F"] as const;
export type NodeLabel = (typeof NODES)[number];

/**
 * All 15 canonical node pairs in alphabetical order.
 * Index maps directly to input[1..15].
 */
export const ALL_PAIRS: readonly [string, string][] = (() => {
  const pairs: [string, string][] = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      pairs.push([NODES[i], NODES[j]]);
    }
  }
  return pairs;
})();

export type DecodedGraph = {
  source: string;
  edges: { from: string; to: string; weight: number }[];
};

/**
 * Decode a number[] (length 16) into source + edge list.
 * input[0] = source index (0–5), input[1..15] = weights for ALL_PAIRS.
 * Weight 0 = edge absent, >0 = edge present with that weight.
 */
export function decodeGraphInput(input: number[]): DecodedGraph {
  const sourceIdx = Math.max(0, Math.min(5, input[0] ?? 0));
  const source = NODES[sourceIdx];

  const edges: DecodedGraph["edges"] = [];
  for (let i = 0; i < ALL_PAIRS.length; i++) {
    const w = input[i + 1] ?? 0;
    if (w > 0) {
      edges.push({ from: ALL_PAIRS[i][0], to: ALL_PAIRS[i][1], weight: w });
    }
  }

  return { source, edges };
}

/**
 * Encode source + edge list back into number[16].
 */
export function encodeGraphInput(
  sourceIdx: number,
  edges: { from: string; to: string; weight: number }[],
): number[] {
  const arr = new Array(16).fill(0);
  arr[0] = Math.max(0, Math.min(5, sourceIdx));

  for (const e of edges) {
    const a = e.from < e.to ? e.from : e.to;
    const b = e.from < e.to ? e.to : e.from;
    const idx = ALL_PAIRS.findIndex(([x, y]) => x === a && y === b);
    if (idx >= 0) arr[idx + 1] = e.weight;
  }

  return arr;
}

/**
 * Serialize edges to textarea string.
 * Weighted: "A-B:3, A-C:1, ..."
 * Unweighted: "A-B, A-C, ..."
 */
export function serializeEdges(
  edges: { from: string; to: string; weight: number }[],
  weighted: boolean,
): string {
  return edges
    .map((e) => {
      const label = `${e.from}-${e.to}`;
      return weighted ? `${label}:${e.weight}` : label;
    })
    .join(", ");
}

export type EdgeParseResult =
  | { ok: true; edges: { from: string; to: string; weight: number }[] }
  | { ok: false; error: string };

/**
 * Parse a textarea string into edge list.
 * Accepts "A-B:3, C-D:1" (weighted) or "A-B, C-D" (unweighted, weight=1).
 */
export function parseEdges(raw: string, weighted: boolean): EdgeParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter at least one edge" };

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const seen = new Set<string>();
  const edges: { from: string; to: string; weight: number }[] = [];

  for (const p of parts) {
    const match = weighted
      ? /^([A-F])-([A-F]):(\d+)$/i.exec(p)
      : /^([A-F])-([A-F])(?::(\d+))?$/i.exec(p);

    if (!match) {
      return {
        ok: false,
        error: weighted
          ? `Invalid edge "${p}" — use A-B:3 format`
          : `Invalid edge "${p}" — use A-B format`,
      };
    }

    const from = match[1].toUpperCase();
    const to = match[2].toUpperCase();
    const w = weighted ? Number(match[3]) : 1;

    if (from === to) {
      return { ok: false, error: `Self-loop "${p}" not allowed` };
    }

    if (w < 1 || w > 99) {
      return { ok: false, error: `Weight must be 1–99 in "${p}"` };
    }

    // Canonical order for dedup
    const key = from < to ? `${from}-${to}` : `${to}-${from}`;
    if (seen.has(key)) continue; // skip duplicates silently
    seen.add(key);

    edges.push({
      from: from < to ? from : to,
      to: from < to ? to : from,
      weight: w,
    });
  }

  if (edges.length === 0) {
    return { ok: false, error: "Need at least one edge" };
  }

  return { ok: true, edges };
}

/**
 * Generate a random graph. Ensures the source is connected to at least one node.
 */
export function randomizeGraph(weighted: boolean): number[] {
  const sourceIdx = Math.floor(Math.random() * NODES.length);
  const source = NODES[sourceIdx];

  const arr = new Array(16).fill(0);
  arr[0] = sourceIdx;

  // Each edge has ~50% chance of existing
  let sourceConnected = false;
  for (let i = 0; i < ALL_PAIRS.length; i++) {
    if (Math.random() < 0.5) {
      arr[i + 1] = weighted ? Math.floor(Math.random() * 19) + 1 : 1;
      if (ALL_PAIRS[i][0] === source || ALL_PAIRS[i][1] === source) {
        sourceConnected = true;
      }
    }
  }

  // Guarantee at least one edge from source
  if (!sourceConnected) {
    const candidates = ALL_PAIRS
      .map((p, i) => ({ pair: p, idx: i }))
      .filter(({ pair }) => pair[0] === source || pair[1] === source);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    arr[pick.idx + 1] = weighted ? Math.floor(Math.random() * 19) + 1 : 1;
  }

  return arr;
}

/** Default Dijkstra input: source=A, weighted edges matching original graph. */
export const DEFAULT_DIJKSTRA_INPUT = [0, 3, 1, 4, 0, 0, 0, 0, 6, 0, 2, 0, 7, 1, 5, 2];
