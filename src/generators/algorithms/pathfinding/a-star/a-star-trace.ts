// src/generators/algorithms/pathfinding/a-star/a-star-trace.ts

import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import {
  decodeAstarGrid,
  DEFAULT_ASTAR_GRID,
} from "../../../../lib/astar-grid-utils";
import { DIRECTIONS } from "../../../../lib/grid-utils";

/* Grid cell layout — same offsets as BFS/Dijkstra grid trace */
const GRID_X0 = 2;
const GRID_Y0 = 1;

/* Secondary display layout (below grid) — two info rows */
const CUR_LABEL_X = 0.5;
const CUR_NODE_X = 1.5;
const G_LABEL_X = 3;
const G_NODE_X = 4;
const F_LABEL_X = 5.5;
const F_NODE_X = 6.5;

const NB_LABEL_X = 0.5;
const NB_NODE_X = 1.5;
const WT_LABEL_X = 3;
const WT_NODE_X = 4;
const H_LABEL_X = 5.5;
const H_NODE_X = 6.5;

/* Helpers */

function cellX(c: number): number { return GRID_X0 + c; }
function cellY(r: number): number { return GRID_Y0 + r; }
function cellId(r: number, c: number): string { return `as:${r}:${c}`; }

/* Trace generator */

export function astarTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length >= 6 ? input : DEFAULT_ASTAR_GRID;
  const { rows, cols, startRow, startCol, goalRow, goalCol, weights } = decodeAstarGrid(encoded);

  // Heuristic: Manhattan distance
  function h(r: number, c: number): number {
    return Math.abs(r - goalRow) + Math.abs(c - goalCol);
  }

  // Dynamic layout values
  const INFO_Y1 = GRID_Y0 + rows + 1;   // cur | g | f
  const INFO_Y2 = INFO_Y1 + 1;           // nb | wt | h
  const BOUNDS = {
    minX: 0,
    minY: 0,
    maxX: GRID_X0 + cols + 2,
    maxY: INFO_Y2 + 2,
  };

  // A* state
  const g: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(Infinity),
  );
  const f: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(Infinity),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );
  const prev: ([number, number] | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );

  g[startRow][startCol] = 0;
  f[startRow][startCol] = h(startRow, startCol);

  let curCell: [number, number] | null = null;
  let activeNb: { r: number; c: number; w: number } | null = null;
  let justUpdated: [number, number] | null = null;
  let showResult = false;
  let pathCells: Set<string> | null = null;
  let goalReached = false;

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
        const d = g[r][c];
        const isDiscovered = d < Infinity;
        const isStart = r === startRow && c === startCol;
        const isGoal = r === goalRow && c === goalCol;
        const isCur = curCell !== null && curCell[0] === r && curCell[1] === c;
        const isActiveNb = activeNb !== null && activeNb.r === r && activeNb.c === c;
        const isJustUpdated = justUpdated !== null && justUpdated[0] === r && justUpdated[1] === c;
        const isOnPath = pathCells !== null && pathCells.has(`${r},${c}`);

        let tone: "muted" | "info" | "neutral" | "accent" | "warning" | "danger";
        let emphasis: "faint" | "soft" | undefined;
        let opacityMul: number | undefined;
        let value: string | number | undefined;

        if (isWall) {
          tone = "muted";
          emphasis = "faint";
          opacityMul = 0.15;
          value = undefined;
        } else if (showResult && isOnPath && isGoal) {
          tone = "danger";
          emphasis = undefined;
          value = d;
        } else if (showResult && isOnPath && isStart) {
          tone = "warning";
          emphasis = undefined;
          value = d;
        } else if (showResult && isOnPath) {
          tone = "accent";
          emphasis = undefined;
          value = d;
        } else if (showResult && isVisited) {
          tone = "neutral";
          emphasis = "soft";
          value = d;
        } else if (showResult && isGoal && !goalReached) {
          // Unreachable goal in result frame
          tone = "danger";
          emphasis = "soft";
          value = "\u221e";
        } else if (isCur) {
          tone = "warning";
          emphasis = undefined;
          value = d;
        } else if (isJustUpdated) {
          tone = "accent";
          emphasis = undefined;
          value = d;
        } else if (isActiveNb) {
          tone = "accent";
          emphasis = undefined;
          value = isDiscovered ? d : "\u221e";
        } else if (isGoal && !isVisited) {
          // Unvisited goal — always visible
          tone = "danger";
          emphasis = "soft";
          value = isDiscovered ? d : "\u2605";
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

    // Secondary display row 1 — current cell info: cur | g | f
    if (curCell) {
      const [cr, cc] = curCell;
      const curG = g[cr][cc];
      const curF = f[cr][cc];

      overlays.push({
        kind: "caption" as const,
        id: "as:cur-label",
        x: CUR_LABEL_X,
        y: INFO_Y1,
        text: "cur",
        emphasis: "soft" as const,
      });
      nodes.push({
        id: "as:cur",
        kind: "cell",
        pos: { x: CUR_NODE_X, y: INFO_Y1 },
        meta: {
          value: `${cr},${cc}`,
          tone: "warning" as const,
        },
      });

      overlays.push({
        kind: "caption" as const,
        id: "as:g-label",
        x: G_LABEL_X,
        y: INFO_Y1,
        text: "g",
        emphasis: "soft" as const,
      });
      nodes.push({
        id: "as:g",
        kind: "cell",
        pos: { x: G_NODE_X, y: INFO_Y1 },
        meta: {
          value: curG === Infinity ? "\u221e" : curG,
          tone: "warning" as const,
          emphasis: "soft" as const,
        },
      });

      overlays.push({
        kind: "caption" as const,
        id: "as:f-label",
        x: F_LABEL_X,
        y: INFO_Y1,
        text: "f",
        emphasis: "soft" as const,
      });
      nodes.push({
        id: "as:f",
        kind: "cell",
        pos: { x: F_NODE_X, y: INFO_Y1 },
        meta: {
          value: curF === Infinity ? "\u221e" : curF,
          tone: "warning" as const,
          emphasis: "soft" as const,
        },
      });

      // Secondary display row 2 — neighbor info: nb | wt | h
      if (activeNb) {
        overlays.push({
          kind: "caption" as const,
          id: "as:nb-label",
          x: NB_LABEL_X,
          y: INFO_Y2,
          text: "nb",
          emphasis: "soft" as const,
        });
        nodes.push({
          id: "as:nb",
          kind: "cell",
          pos: { x: NB_NODE_X, y: INFO_Y2 },
          meta: {
            value: `${activeNb.r},${activeNb.c}`,
            tone: "accent" as const,
          },
        });

        overlays.push({
          kind: "caption" as const,
          id: "as:wt-label",
          x: WT_LABEL_X,
          y: INFO_Y2,
          text: "wt",
          emphasis: "soft" as const,
        });
        nodes.push({
          id: "as:wt",
          kind: "cell",
          pos: { x: WT_NODE_X, y: INFO_Y2 },
          meta: {
            value: activeNb.w,
            tone: "accent" as const,
            emphasis: "soft" as const,
          },
        });

        overlays.push({
          kind: "caption" as const,
          id: "as:h-label",
          x: H_LABEL_X,
          y: INFO_Y2,
          text: "h",
          emphasis: "soft" as const,
        });
        nodes.push({
          id: "as:h",
          kind: "cell",
          pos: { x: H_NODE_X, y: INFO_Y2 },
          meta: {
            value: h(activeNb.r, activeNb.c),
            tone: "accent" as const,
            emphasis: "soft" as const,
          },
        });
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

    applyPointerMasking(scene.nodes, args.pointers);

    frames.push({
      id: `as.${args.kind}.${stepNo++}`,
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

  /* Pointer helper — neighbor direction */
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

  // as.init.g
  push({
    kind: "init.g",
    codeToken: "as.init.g",
    narrationToken: "as.init.g",
    meta: { source: `(${startRow},${startCol})`, goal: `(${goalRow},${goalCol})` },
  });

  // as.init.f
  push({
    kind: "init.f",
    codeToken: "as.init.f",
    narrationToken: "as.init.f",
  });

  // as.init.visited
  push({
    kind: "init.visited",
    codeToken: "as.init.visited",
    narrationToken: "as.init.visited",
  });

  // as.init.setg — g[source] = 0, f[source] = h(source)
  push({
    kind: "init.setg",
    codeToken: "as.init.setg",
    narrationToken: "as.init.setg",
    focusNodes: [cellId(startRow, startCol)],
    meta: {
      source: `(${startRow},${startCol})`,
      goal: `(${goalRow},${goalCol})`,
      f: f[startRow][startCol],
    },
  });

  // --- Main loop: A* ---
  const totalCells = rows * cols;
  let visitedCount = 0;

  while (visitedCount < totalCells) {
    // Pick unvisited cell with minimum f-score
    let uR = -1;
    let uC = -1;
    let minF = Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && weights[r][c] !== 0 && f[r][c] < minF) {
          minF = f[r][c];
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

    // as.loop
    push({
      kind: "loop",
      codeToken: "as.loop",
      narrationToken: "as.loop",
      focusNodes: [cellId(uR, uC)],
      meta: { unvisitedCount },
    });

    // as.pick
    push({
      kind: "pick",
      codeToken: "as.pick",
      narrationToken: "as.pick",
      focusNodes: [cellId(uR, uC), "as:cur", "as:g", "as:f"],
      meta: { u: `(${uR},${uC})`, g: g[uR][uC], f: f[uR][uC], h: h(uR, uC) },
    });

    // as.goal — check if current == goal
    const isGoalCell = uR === goalRow && uC === goalCol;
    push({
      kind: "goal",
      codeToken: "as.goal",
      narrationToken: "as.goal",
      focusNodes: [cellId(uR, uC)],
      meta: { u: `(${uR},${uC})`, result: isGoalCell ? "found" : "not-goal" },
    });

    if (isGoalCell) {
      goalReached = true;
      break;
    }

    // Relax neighbors — only valid, non-wall cells
    for (const [dr, dc, dirLabel] of DIRECTIONS) {
      const nr = uR + dr;
      const nc = uC + dc;

      // Skip out-of-bounds and walls — no frames emitted
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (weights[nr][nc] === 0) continue;

      const w = weights[nr][nc];

      // Set active neighbor
      activeNb = { r: nr, c: nc, w };
      justUpdated = null;

      // as.neighbors
      push({
        kind: "neighbors",
        codeToken: "as.neighbors",
        narrationToken: "as.neighbors",
        focusNodes: [cellId(uR, uC), cellId(nr, nc), "as:nb", "as:wt", "as:h"],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w },
      });

      // as.check.visited
      const isVisited = visited[nr][nc];
      push({
        kind: "check.visited",
        codeToken: "as.check.visited",
        narrationToken: "as.check.visited",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, w, result: isVisited ? "fail" : "pass" },
      });
      if (isVisited) {
        activeNb = null;
        continue;
      }

      const tentG = g[uR][uC] + w;

      // as.relax
      push({
        kind: "relax",
        codeToken: "as.relax",
        narrationToken: "as.relax",
        focusNodes: [cellId(uR, uC), cellId(nr, nc)],
        pointers: [vPointer(nr, nc, dirLabel)],
        meta: {
          u: `(${uR},${uC})`,
          v: `(${nr},${nc})`,
          w,
          g: g[uR][uC],
          tentG,
          currentG: g[nr][nc] === Infinity ? "\u221e" : g[nr][nc],
        },
      });

      if (tentG < g[nr][nc]) {
        const oldG = g[nr][nc];
        g[nr][nc] = tentG;
        f[nr][nc] = tentG + h(nr, nc);
        prev[nr][nc] = [uR, uC];

        // Show the updated cell
        justUpdated = [nr, nc];
        activeNb = null;

        // as.update
        push({
          kind: "update",
          codeToken: "as.update",
          narrationToken: "as.update",
          focusNodes: [cellId(nr, nc)],
          pointers: [vPointer(nr, nc, dirLabel)],
          meta: {
            u: `(${uR},${uC})`,
            v: `(${nr},${nc})`,
            w,
            oldG: oldG === Infinity ? "\u221e" : oldG,
            newG: tentG,
            newF: f[nr][nc],
            h: h(nr, nc),
          },
        });

        justUpdated = null;
      } else {
        // as.skip
        push({
          kind: "skip",
          codeToken: "as.relax",
          narrationToken: "as.skip",
          focusNodes: [cellId(uR, uC), cellId(nr, nc)],
          pointers: [vPointer(nr, nc, dirLabel)],
          meta: { u: `(${uR},${uC})`, v: `(${nr},${nc})`, currentG: g[nr][nc], tentG },
        });
      }

      activeNb = null;
    }

    // as.visit — mark u as visited
    activeNb = null;
    justUpdated = null;
    visited[uR][uC] = true;
    visitedCount++;
    push({
      kind: "visit",
      codeToken: "as.visit",
      narrationToken: "as.visit",
      focusNodes: [cellId(uR, uC), "as:cur"],
      meta: { u: `(${uR},${uC})`, g: g[uR][uC] },
    });

    curCell = null;
  }

  // --- Done — conclusive result frame ---
  curCell = null;
  activeNb = null;
  justUpdated = null;

  // Reconstruct path if goal was reached
  pathCells = new Set<string>();
  if (goalReached) {
    let pr: number | null = goalRow;
    let pc: number | null = goalCol;
    while (pr !== null && pc !== null) {
      pathCells.add(`${pr},${pc}`);
      const p = prev[pr][pc];
      if (p === null) {
        // Check if this is the start cell
        if (pr === startRow && pc === startCol) break;
        break;
      }
      pr = p[0];
      pc = p[1];
    }
    // Always include start
    pathCells.add(`${startRow},${startCol}`);
  }

  showResult = true;
  const doneScene = buildScene();

  // Add summary caption above the grid
  const captionText = goalReached
    ? `Shortest path: (${startRow},${startCol}) \u2192 (${goalRow},${goalCol}), cost ${g[goalRow][goalCol]}`
    : `No path from (${startRow},${startCol}) to (${goalRow},${goalCol})`;
  // Caption is left-aligned; estimate char width (~0.18 grid units each at text-xs mono)
  // to shift x so the text appears centred above the grid.
  const gridCenterX = GRID_X0 + cols / 2;
  const estimatedTextW = captionText.length * 0.18;
  doneScene.overlays!.push({
    kind: "caption" as const,
    id: "as:result-label",
    x: Math.max(0, gridCenterX - estimatedTextW / 2),
    y: GRID_Y0 - 0.6,
    text: captionText,
    emphasis: "soft" as const,
  });

  const focusIds: string[] = [];
  if (goalReached) {
    for (const key of pathCells) {
      const [r, c] = key.split(",").map(Number);
      focusIds.push(cellId(r, c));
    }
  }

  frames.push({
    id: `as.done.${stepNo++}`,
    kind: "done",
    codeToken: "as.done",
    narrationToken: "as.done",
    scene: doneScene,
    focus: {
      nodes: focusIds.length ? focusIds : undefined,
    },
    meta: goalReached
      ? { pathLen: pathCells.size, pathCost: g[goalRow][goalCol] }
      : { noPath: true },
  });

  return frames;
}
