// src/generators/algorithms/pathfinding/dijkstra/dijkstra-grid-trace.ts

import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import { createOpsChart, veRef } from "../../../../lib/ops-chart";
import {
  decodeWeightedGrid,
  DEFAULT_DIJKSTRA_GRID,
} from "../../../../lib/weighted-grid-utils";
import { DIRECTIONS } from "../../../../lib/grid-utils";

/* Grid cell layout — same offsets as BFS grid trace */
const GRID_X0 = 2;
const GRID_Y0 = 1;

/* Secondary display layout (below grid) */
const CUR_LABEL_X = 0.5;
const CUR_NODE_X = 1.5;
const COST_LABEL_X = 3;
const COST_NODE_X = 4;
const NB_LABEL_X = 5.5;
const NB_NODE_X = 6.5;
const WT_LABEL_X = 8;
const WT_NODE_X = 9;

/* Helpers */

function cellX(c: number): number { return GRID_X0 + c; }
function cellY(r: number): number { return GRID_Y0 + r; }
function cellId(r: number, c: number): string { return `dj:${r}:${c}`; }

/* Trace generator */

export function dijkstraGridTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length >= 4 ? input : DEFAULT_DIJKSTRA_GRID;
  const { rows, cols, startRow, startCol, weights } = decodeWeightedGrid(encoded);

  // Dynamic layout values
  const INFO_Y = GRID_Y0 + rows + 1;
  const BOUNDS = {
    minX: 0,
    minY: 0,
    maxX: GRID_X0 + cols + 2,
    maxY: INFO_Y + 2,
  };

  // Dijkstra state
  const dist: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(Infinity),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  dist[startRow][startCol] = 0;

  // Count vertices and edges for reference curve
  let vertexCount = 0;
  let edgeCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (weights[r][c] === 0) continue;
      vertexCount++;
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && weights[nr][nc] !== 0) {
          edgeCount++;
        }
      }
    }
  }
  const opsChart = createOpsChart(veRef(vertexCount, edgeCount));

  let curCell: [number, number] | null = null;
  let activeNb: { r: number; c: number; w: number } | null = null;
  let justUpdated: [number, number] | null = null;
  let showResult = false;

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
        const isCur = curCell !== null && curCell[0] === r && curCell[1] === c;
        const isActiveNb = activeNb !== null && activeNb.r === r && activeNb.c === c;
        const isJustUpdated = justUpdated !== null && justUpdated[0] === r && justUpdated[1] === c;

        let tone: "muted" | "info" | "neutral" | "accent" | "warning";
        let emphasis: "faint" | "soft" | undefined;
        let opacityMul: number | undefined;
        let value: string | number | undefined;

        if (isWall) {
          tone = "muted";
          emphasis = "faint";
          opacityMul = 0.15;
          value = undefined;
        } else if (showResult && isStart) {
          tone = "warning";
          emphasis = undefined;
          value = d;
        } else if (showResult && isVisited) {
          tone = "accent";
          emphasis = undefined;
          value = d;
        } else if (isCur) {
          tone = "warning";
          emphasis = undefined;
          value = d;
        } else if (isJustUpdated) {
          // Flash: cell was just updated with a cheaper cost
          tone = "accent";
          emphasis = undefined;
          value = d;
        } else if (isActiveNb) {
          // Neighbor being examined — show current dist (∞ if unreached)
          tone = "accent";
          emphasis = undefined;
          value = isDiscovered ? d : "\u221e";
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
      }
    }

    // Secondary display — current cell info + neighbor info
    if (curCell) {
      const [cr, cc] = curCell;
      const curDist = dist[cr][cc];

      // "cur" label + cell
      overlays.push({
        kind: "caption" as const,
        id: "dj:cur-label",
        x: CUR_LABEL_X,
        y: INFO_Y,
        text: "cur",
        emphasis: "soft" as const,
      });
      nodes.push({
        id: "dj:cur",
        kind: "cell",
        pos: { x: CUR_NODE_X, y: INFO_Y },
        meta: {
          value: `${cr},${cc}`,
          tone: "warning" as const,
        },
      });

      // "cost" label + cell
      overlays.push({
        kind: "caption" as const,
        id: "dj:cost-label",
        x: COST_LABEL_X,
        y: INFO_Y,
        text: "cost",
        emphasis: "soft" as const,
      });
      nodes.push({
        id: "dj:cost",
        kind: "cell",
        pos: { x: COST_NODE_X, y: INFO_Y },
        meta: {
          value: curDist === Infinity ? "\u221e" : curDist,
          tone: "warning" as const,
          emphasis: "soft" as const,
        },
      });

      // Neighbor section — only shown during neighbor exploration
      if (activeNb) {
        // "nb" label + cell
        overlays.push({
          kind: "caption" as const,
          id: "dj:nb-label",
          x: NB_LABEL_X,
          y: INFO_Y,
          text: "nb",
          emphasis: "soft" as const,
        });
        nodes.push({
          id: "dj:nb",
          kind: "cell",
          pos: { x: NB_NODE_X, y: INFO_Y },
          meta: {
            value: `${activeNb.r},${activeNb.c}`,
            tone: "accent" as const,
          },
        });

        // "wt" label + cell (weight = cost to enter neighbor)
        overlays.push({
          kind: "caption" as const,
          id: "dj:wt-label",
          x: WT_LABEL_X,
          y: INFO_Y,
          text: "wt",
          emphasis: "soft" as const,
        });
        nodes.push({
          id: "dj:wt",
          kind: "cell",
          pos: { x: WT_NODE_X, y: INFO_Y },
          meta: {
            value: activeNb.w,
            tone: "accent" as const,
            emphasis: "soft" as const,
          },
        });
      }
    }

    const chart = opsChart.overlay();
    if (chart) overlays.push(chart);

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

    applyPointerMasking(scene.nodes, args.pointers);

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

  /* Pointer helper — neighbor direction only (no u pointer) */
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

  // --- Init phase (3 frames — no prev in grid mode) ---

  // dj.init.dist
  push({
    kind: "init.dist",
    codeToken: "dj.init.dist",
    narrationToken: "dj.init.dist",
    meta: { source: `(${startRow},${startCol})` },
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
    curCell = [uR, uC];
    activeNb = null;
    justUpdated = null;

    // dj.loop
    push({
      kind: "loop",
      codeToken: "dj.loop",
      narrationToken: "dj.loop",
      focusNodes: [cellId(uR, uC)],
      meta: { unvisitedCount },
    });

    // dj.pick
    push({
      kind: "pick",
      codeToken: "dj.pick",
      narrationToken: "dj.pick",
      focusNodes: [cellId(uR, uC), "dj:cur", "dj:cost"],
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

      // Set active neighbor — highlights cell on grid + shows nb/wt in secondary display
      activeNb = { r: nr, c: nc, w };
      justUpdated = null;

      // dj.neighbors
      push({
        kind: "neighbors",
        codeToken: "dj.neighbors",
        narrationToken: "dj.neighbors",
        focusNodes: [cellId(uR, uC), cellId(nr, nc), "dj:nb", "dj:wt"],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w },
      });

      // dj.check.visited
      const isVisited = visited[nr][nc];
      push({
        kind: "check.visited",
        codeToken: "dj.check.visited",
        narrationToken: "dj.check.visited",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w, result: isVisited ? "fail" : "pass" },
      });
      if (isVisited) {
        activeNb = null;
        continue;
      }

      const tentative = dist[uR][uC] + w;

      // dj.relax
      opsChart.record();
      push({
        kind: "relax",
        codeToken: "dj.relax",
        narrationToken: "dj.relax",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w, uDist: dist[uR][uC], tentative, currentDist: dist[nr][nc] === Infinity ? "\u221e" : dist[nr][nc] },
      });

      if (tentative < dist[nr][nc]) {
        const oldDist = dist[nr][nc];
        dist[nr][nc] = tentative;

        // Show the updated cell with accent highlight
        justUpdated = [nr, nc];
        activeNb = null;

        // dj.update
        push({
          kind: "update",
          codeToken: "dj.update",
          narrationToken: "dj.update",
          focusNodes: [cellId(nr, nc)],
          pointers: [vPointer(nr, nc, dirLabel)],
          meta: {
            u: `(${uR},${uC})`,
            v: `(${nr},${nc})`,
            w,
            oldDist: oldDist === Infinity ? "\u221e" : oldDist,
            newDist: tentative,
          },
        });

        justUpdated = null;
      } else {
        // dj.skip
        push({
          kind: "skip",
          codeToken: "dj.relax",
          narrationToken: "dj.skip",
          focusNodes: [cellId(uR, uC), cellId(nr, nc)],
          pointers: [vPointer(nr, nc, dirLabel)],
          meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, currentDist: dist[nr][nc], tentative },
        });
      }

      activeNb = null;
    }

    // dj.visit — mark u as visited
    activeNb = null;
    justUpdated = null;
    visited[uR][uC] = true;
    visitedCount++;
    push({
      kind: "visit",
      codeToken: "dj.visit",
      narrationToken: "dj.visit",
      focusNodes: [cellId(uR, uC), "dj:cur"],
      meta: { u: `(${uR},${uC})`, dist: dist[uR][uC] },
    });

    curCell = null;
  }

  // --- Done — conclusive result frame ---
  curCell = null;
  activeNb = null;
  justUpdated = null;
  let totalVisited = 0;
  const reachableIds: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r][c]) {
        totalVisited++;
        reachableIds.push(cellId(r, c));
      }
    }
  }

  showResult = true;
  const doneScene = buildScene();
  // Add summary caption above the grid
  doneScene.overlays!.push({
    kind: "caption" as const,
    id: "dj:result-label",
    x: GRID_X0 + cols / 2 - 0.5,
    y: GRID_Y0 - 0.6,
    text: `Shortest distances from (${startRow},${startCol})`,
    emphasis: "soft" as const,
  });

  frames.push({
    id: `dj.done.${stepNo++}`,
    kind: "done",
    codeToken: "dj.done",
    narrationToken: "dj.done",
    scene: doneScene,
    focus: {
      nodes: reachableIds,
    },
    meta: { totalVisited },
  });

  return frames;
}
