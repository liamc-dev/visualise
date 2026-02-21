// src/generators/algorithms/pathfinding/dijkstra/dijkstra-grid-trace.ts

import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import {
  decodeWeightedGrid,
  DEFAULT_DIJKSTRA_GRID,
} from "../../../../lib/weighted-grid-utils";
import { DIRECTIONS } from "../../../../lib/grid-utils";

/* Grid cell layout — same offsets as BFS grid trace */
const GRID_X0 = 2;
const GRID_Y0 = 1;

/* Helpers */

function cellX(c: number): number { return GRID_X0 + c; }
function cellY(r: number): number { return GRID_Y0 + r; }
function cellId(r: number, c: number): string { return `dj:${r}:${c}`; }

/* Trace generator */

export function dijkstraGridTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length >= 4 ? input : DEFAULT_DIJKSTRA_GRID;
  const { rows, cols, startRow, startCol, weights } = decodeWeightedGrid(encoded);

  // Dynamic bounds
  const BOUNDS = {
    minX: 0,
    minY: 0,
    maxX: GRID_X0 + cols + 2,
    maxY: GRID_Y0 + rows + 2,
  };

  // Dijkstra state
  const dist: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(Infinity),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  dist[startRow][startCol] = 0;

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  /* Scene builder */
  function buildScene(): TraceScene {
    const nodes: TraceNode[] = [];
    const overlays: TraceOverlay[] = [];

    // Grid cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const w = weights[r][c];
        const isWall = w === 0;
        const isVisited = visited[r][c];
        const d = dist[r][c];
        const isDiscovered = d < Infinity;
        const isStart = r === startRow && c === startCol;

        let tone: "muted" | "info" | "neutral" | "accent";
        let emphasis: "faint" | "soft" | undefined;
        let opacityMul: number | undefined;
        let value: string | number | undefined;

        if (isWall) {
          tone = "muted";
          emphasis = "faint";
          opacityMul = 0.15;
          value = undefined;
        } else if (isVisited) {
          tone = "neutral";
          emphasis = "soft";
          value = d;
        } else if (isDiscovered) {
          tone = "info";
          emphasis = undefined;
          value = d;
        } else if (isStart) {
          tone = "accent";
          emphasis = undefined;
          value = 0;
        } else {
          tone = "muted";
          emphasis = undefined;
          opacityMul = 0.3;
          value = "\u2014";
        }

        nodes.push({
          id: cellId(r, c),
          kind: "cell",
          pos: { x: cellX(c), y: cellY(r) },
          meta: {
            value,
            tone,
            emphasis,
            ...(opacityMul !== undefined ? { opacityMul } : undefined),
          },
        });

        // Weight caption for non-wall cells
        if (!isWall) {
          overlays.push({
            kind: "caption" as const,
            id: `dj:w:${r}:${c}`,
            x: cellX(c),
            y: cellY(r) + 0.35,
            text: String(w),
            emphasis: "soft" as const,
          });
        }
      }
    }

    return {
      nodes,
      edges: [],
      overlays,
      bounds: BOUNDS,
    };
  }

  /* Frame pusher */
  function push(args: {
    kind: string;
    codeToken: string;
    narrationToken: string;
    focusNodes?: string[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) {
    const scene = buildScene();

    // Pointer masking — hide values behind pointer badges
    if (args.pointers?.length) {
      const behindIds = new Set<string>();
      for (const p of args.pointers) {
        if (p.target.kind !== "node") continue;
        const m = p.target.nodeId.match(/^dj:(\d+):(\d+)$/);
        if (!m) continue;
        const tr = parseInt(m[1]);
        const tc = parseInt(m[2]);
        const lane = p.lane ?? "above";
        if (lane === "above" && tr > 0)
          behindIds.add(cellId(tr - 1, tc));
        else if (lane === "below" && tr < rows - 1)
          behindIds.add(cellId(tr + 1, tc));
        else if (lane === "left" && tc > 0)
          behindIds.add(cellId(tr, tc - 1));
        else if (lane === "right" && tc < cols - 1)
          behindIds.add(cellId(tr, tc + 1));
      }
      for (const node of scene.nodes) {
        if (behindIds.has(node.id) && node.meta) {
          node.meta = { ...node.meta, value: "" };
        }
      }
    }

    frames.push({
      id: `dj.${args.kind}.${stepNo++}`,
      kind: args.kind,
      codeToken: args.codeToken,
      narrationToken: args.narrationToken,
      scene,
      focus: {
        nodes: args.focusNodes?.length ? args.focusNodes : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  }

  /* Pointer helpers */
  function uPointer(r: number, c: number): TracePointer {
    return {
      id: "u",
      label: "u",
      target: { kind: "node", nodeId: cellId(r, c) },
      lane: "above",
      color: "var(--color-tn-warning)",
    };
  }

  function vPointer(nr: number, nc: number, dir: string): TracePointer {
    const lane =
      dir === "UP" ? "above" :
      dir === "DOWN" ? "below" :
      dir === "LEFT" ? "left" :
      "right";
    return {
      id: "v",
      label: "v",
      target: { kind: "node", nodeId: cellId(nr, nc) },
      lane,
      color: "var(--color-tn-cyan)",
    };
  }

  /* ========== Algorithm ========== */

  // --- Init phase (4 frames) ---

  // dj.init.dist
  push({
    kind: "init.dist",
    codeToken: "dj.init.dist",
    narrationToken: "dj.init.dist",
    meta: { source: `(${startRow},${startCol})` },
  });

  // dj.init.prev
  push({
    kind: "init.prev",
    codeToken: "dj.init.prev",
    narrationToken: "dj.init.prev",
  });

  // dj.init.visited
  push({
    kind: "init.visited",
    codeToken: "dj.init.visited",
    narrationToken: "dj.init.visited",
  });

  // dj.init.setdist — dist[source] = 0
  push({
    kind: "init.setdist",
    codeToken: "dj.init.setdist",
    narrationToken: "dj.init.setdist",
    focusNodes: [cellId(startRow, startCol)],
    meta: { source: `(${startRow},${startCol})` },
  });

  // --- Main loop: O(V^2) Dijkstra ---
  const totalCells = rows * cols;
  let visitedCount = 0;

  while (visitedCount < totalCells) {
    // Pick unvisited cell with minimum distance
    let uR = -1;
    let uC = -1;
    let minDist = Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && weights[r][c] !== 0 && dist[r][c] < minDist) {
          minDist = dist[r][c];
          uR = r;
          uC = c;
        }
      }
    }
    if (uR < 0) break; // no more reachable cells

    const unvisitedCount = totalCells - visitedCount;

    // dj.loop
    push({
      kind: "loop",
      codeToken: "dj.loop",
      narrationToken: "dj.loop",
      pointers: [uPointer(uR, uC)],
      meta: { unvisitedCount },
    });

    // dj.pick
    push({
      kind: "pick",
      codeToken: "dj.pick",
      narrationToken: "dj.pick",
      focusNodes: [cellId(uR, uC)],
      pointers: [uPointer(uR, uC)],
      meta: { u: `(${uR},${uC})`, dist: dist[uR][uC] },
    });

    // Relax neighbors — only valid, non-wall cells
    for (const [dr, dc, dirLabel] of DIRECTIONS) {
      const nr = uR + dr;
      const nc = uC + dc;

      // Skip out-of-bounds and walls — no frames emitted
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (weights[nr][nc] === 0) continue;

      const w = weights[nr][nc];

      // dj.neighbors
      push({
        kind: "neighbors",
        codeToken: "dj.neighbors",
        narrationToken: "dj.neighbors",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [uPointer(uR, uC), vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w },
      });

      // dj.check.visited
      const isVisited = visited[nr][nc];
      push({
        kind: "check.visited",
        codeToken: "dj.check.visited",
        narrationToken: "dj.check.visited",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [uPointer(uR, uC), vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w, result: isVisited ? "fail" : "pass" },
      });
      if (isVisited) continue;

      const tentative = dist[uR][uC] + w;

      // dj.relax
      push({
        kind: "relax",
        codeToken: "dj.relax",
        narrationToken: "dj.relax",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [uPointer(uR, uC), vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w, tentative, currentDist: dist[nr][nc] === Infinity ? "\u221e" : dist[nr][nc] },
      });

      if (tentative < dist[nr][nc]) {
        const oldDist = dist[nr][nc];
        dist[nr][nc] = tentative;

        // dj.update
        push({
          kind: "update",
          codeToken: "dj.update",
          narrationToken: "dj.update",
          focusNodes: [cellId(nr, nc)],
          pointers: [uPointer(uR, uC), vPointer(nr, nc, dirLabel)],
          meta: {
            u: `(${uR},${uC})`,
            v: `(${nr},${nc})`,
            w,
            oldDist: oldDist === Infinity ? "\u221e" : oldDist,
            newDist: tentative,
          },
        });
      } else {
        // dj.skip
        push({
          kind: "skip",
          codeToken: "dj.relax",
          narrationToken: "dj.skip",
          focusNodes: [cellId(uR, uC), cellId(nr, nc)],
          pointers: [uPointer(uR, uC), vPointer(nr, nc, dirLabel)],
          meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, currentDist: dist[nr][nc], tentative },
        });
      }
    }

    // dj.visit — mark u as visited
    visited[uR][uC] = true;
    visitedCount++;
    push({
      kind: "visit",
      codeToken: "dj.visit",
      narrationToken: "dj.visit",
      focusNodes: [cellId(uR, uC)],
      pointers: [uPointer(uR, uC)],
      meta: { u: `(${uR},${uC})`, dist: dist[uR][uC] },
    });
  }

  // --- Done ---
  let totalVisited = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c]) totalVisited++;
    }
  }

  push({
    kind: "done",
    codeToken: "dj.done",
    narrationToken: "dj.done",
    meta: { totalVisited },
  });

  return frames;
}
