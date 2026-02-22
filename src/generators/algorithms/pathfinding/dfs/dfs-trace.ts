// src/generators/algorithms/pathfinding/dfs/dfs-trace.ts
// grid[r][c]: 0 = open, 1 = wall. Cells display discovery order (1, 2, 3...).

import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import { applyPointerMasking } from "../../../../lib/trace-utils";
import {
  decodeGridInput,
  DEFAULT_BFS_GRID,
  DIRECTIONS,
} from "../../../../lib/grid-utils";

/* Grid cell layout: x starts at GRID_X0, y starts at GRID_Y0 */
const GRID_X0 = 2;
const GRID_Y0 = 1;

/* Stack visualization layout (horizontal offsets match BFS queue layout) */
const CUR_NODE_X = 1.5;
const STACK_LABEL_X = 3;
const STACK_START_X = 4;
const STACK_SPACING = 1.2;
const STACK_MAX_VISIBLE = 6;

/* Helpers */

function cellX(c: number): number { return GRID_X0 + c; }
function cellY(r: number): number { return GRID_Y0 + r; }
function cellId(r: number, c: number): string { return `dfs:${r}:${c}`; }
function stackNodeId(i: number): string { return `dfs:s:${i}`; }

/* Trace generator */

export function dfsTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length >= 4 || input.length === 66 ? input : DEFAULT_BFS_GRID;
  const { rows, cols, startRow, startCol, walls } = decodeGridInput(encoded);

  // Dynamic layout values
  const STACK_Y = GRID_Y0 + rows + 1;
  const BOUNDS = {
    minX: 0,
    minY: 0,
    maxX: GRID_X0 + cols + 2,
    maxY: STACK_Y + 2,
  };

  // DFS state
  const order: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );
  const discovered: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  const stack: [number, number][] = [];
  let curCell: [number, number] | null = null;
  let showResult = false;
  let orderCounter = 0;

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  /* Scene builder */
  function buildScene(): TraceScene {
    const nodes: TraceNode[] = [];

    // Grid cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isWall = walls[r][c];
        const isVisited = visited[r][c];
        const isDiscovered = discovered[r][c];
        const isStart = r === startRow && c === startCol;
        const isCur = curCell !== null && curCell[0] === r && curCell[1] === c;
        const ord = order[r][c];

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
          value = ord;
        } else if (showResult && isVisited) {
          tone = "accent";
          emphasis = undefined;
          value = ord;
        } else if (isCur) {
          tone = "warning";
          emphasis = undefined;
          value = ord;
        } else if (isVisited) {
          tone = "neutral";
          emphasis = "soft";
          value = ord;
        } else if (isDiscovered) {
          tone = "info";
          emphasis = undefined;
          value = ord;
        } else if (isStart && !isDiscovered) {
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

    // Cur node (popped cell shown left of stack — warning tone matches the grid highlight)
    if (curCell) {
      const [cr, cc] = curCell;
      nodes.push({
        id: "dfs:cur",
        kind: "cell",
        pos: { x: CUR_NODE_X, y: STACK_Y },
        meta: {
          value: `${cr},${cc}`,
          tone: "warning" as const,
        },
      });
    }

    // Stack nodes (show up to STACK_MAX_VISIBLE — top of stack leftmost)
    const topSlice = stack.slice(-STACK_MAX_VISIBLE).reverse();
    for (let i = 0; i < topSlice.length; i++) {
      const [sr, sc] = topSlice[i];
      nodes.push({
        id: stackNodeId(i),
        kind: "cell",
        pos: { x: STACK_START_X + i * STACK_SPACING, y: STACK_Y },
        meta: {
          value: `${sr},${sc}`,
          tone: "info" as const,
        },
      });
    }

    // Captions
    const overlays: TraceOverlay[] = [];

    if (curCell) {
      overlays.push({
        kind: "caption" as const,
        id: "dfs:cur-label",
        x: 0.5,
        y: STACK_Y,
        text: "cur",
        emphasis: "soft" as const,
      });
    }

    overlays.push({
      kind: "caption" as const,
      id: "dfs:stack-label",
      x: STACK_LABEL_X,
      y: STACK_Y,
      text: "Stack",
      emphasis: "soft" as const,
    });

    // If stack is longer than visible, show "..." indicator
    if (stack.length > STACK_MAX_VISIBLE) {
      overlays.push({
        kind: "caption" as const,
        id: "dfs:stack-overflow",
        x: STACK_START_X + STACK_MAX_VISIBLE * STACK_SPACING,
        y: STACK_Y,
        text: `+${stack.length - STACK_MAX_VISIBLE}`,
        emphasis: "soft" as const,
      });
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
      id: `dfs.${args.kind}.${stepNo++}`,
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
  function nbPointer(nr: number, nc: number, dir: string): TracePointer {
    const lane =
      dir === "UP" ? "above" :
      dir === "DOWN" ? "below" :
      dir === "LEFT" ? "left" :
      "right";
    return {
      id: "nb",
      label: "nb",
      target: { kind: "node", nodeId: cellId(nr, nc) },
      lane,
      color: "var(--color-tn-cyan)",
    };
  }


  /* ========== Algorithm execution with fine-grained frame emissions ========== */

  // --- Init phase (6 frames) ---

  // dfs.init.stack — Create stack
  push({
    kind: "init.stack",
    codeToken: "dfs.init.stack",
    narrationToken: "dfs.init.stack",
    meta: { sr: startRow, sc: startCol },
  });

  // dfs.init.visited — Create visited array
  push({
    kind: "init.visited",
    codeToken: "dfs.init.visited",
    narrationToken: "dfs.init.visited",
  });

  // dfs.init.order — Create order array
  push({
    kind: "init.order",
    codeToken: "dfs.init.order",
    narrationToken: "dfs.init.order",
  });

  // dfs.init.mark — Mark source as visited
  discovered[startRow][startCol] = true;
  push({
    kind: "init.mark",
    codeToken: "dfs.init.mark",
    narrationToken: "dfs.init.mark",
    focusNodes: [cellId(startRow, startCol)],
    meta: { sr: startRow, sc: startCol },
  });

  // dfs.init.setorder — Set source order to 1
  orderCounter++;
  order[startRow][startCol] = orderCounter;
  push({
    kind: "init.setorder",
    codeToken: "dfs.init.setorder",
    narrationToken: "dfs.init.setorder",
    focusNodes: [cellId(startRow, startCol)],
    meta: { sr: startRow, sc: startCol, order: orderCounter },
  });

  // dfs.init.push — Push source
  stack.push([startRow, startCol]);
  push({
    kind: "init.push",
    codeToken: "dfs.init.push",
    narrationToken: "dfs.init.push",
    focusNodes: [cellId(startRow, startCol), stackNodeId(0)],
    meta: { sr: startRow, sc: startCol },
  });

  // --- Main loop ---
  while (stack.length > 0) {
    // dfs.loop — "Stack has N elements"
    push({
      kind: "loop",
      codeToken: "dfs.loop",
      narrationToken: "dfs.loop",
      focusNodes: stack.slice(-STACK_MAX_VISIBLE).reverse().map((_, i) => stackNodeId(i)),
      meta: { stackSize: stack.length },
    });

    // dfs.pop — Pop top cell
    const [r, c] = stack.pop()!;
    curCell = [r, c];
    push({
      kind: "pop",
      codeToken: "dfs.pop",
      narrationToken: "dfs.pop",
      focusNodes: [cellId(r, c), "dfs:cur"],
      meta: { r, c, order: order[r][c] },
    });

    // Check each direction
    for (const [dr, dc, dirLabel] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;

      // dfs.check — Compute neighbor coordinates
      push({
        kind: "check",
        codeToken: "dfs.check",
        narrationToken: "dfs.check",
        focusNodes: [cellId(r, c)],
        meta: { r, c, nr, nc, dir: dirLabel },
      });

      // Bounds check — always emit frame
      const oob = nr < 0 || nr >= rows || nc < 0 || nc >= cols;
      push({
        kind: "oob",
        codeToken: "dfs.oob",
        narrationToken: "dfs.oob",
        focusNodes: oob ? [cellId(r, c)] : [cellId(r, c), cellId(nr, nc)],
        pointers: oob ? undefined : [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: oob ? "fail" : "pass" },
      });
      if (oob) continue;

      // Wall check — always emit frame
      const isWall = walls[nr][nc];
      push({
        kind: "wall",
        codeToken: "dfs.wall",
        narrationToken: "dfs.wall",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: isWall ? "fail" : "pass" },
      });
      if (isWall) continue;

      // Visited check — always emit frame
      const alreadyVisited = discovered[nr][nc];
      push({
        kind: "visited",
        codeToken: "dfs.visited",
        narrationToken: "dfs.visited",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: alreadyVisited ? "fail" : "pass" },
      });
      if (alreadyVisited) continue;

      // Discover: 3 separate frames (mark → setorder → push)
      const newOrder = ++orderCounter;

      // dfs.mark — Mark neighbor as visited
      discovered[nr][nc] = true;
      push({
        kind: "mark",
        codeToken: "dfs.mark",
        narrationToken: "dfs.mark",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel },
      });

      // dfs.setorder — Set neighbor order
      order[nr][nc] = newOrder;
      push({
        kind: "setorder",
        codeToken: "dfs.setorder",
        narrationToken: "dfs.setorder",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, order: newOrder },
      });

      // dfs.push — Push neighbor
      stack.push([nr, nc]);
      const visibleIdx = Math.min(stack.length - 1, STACK_MAX_VISIBLE - 1);
      push({
        kind: "push",
        codeToken: "dfs.push",
        narrationToken: "dfs.push",
        focusNodes: [cellId(r, c), cellId(nr, nc), stackNodeId(visibleIdx)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, order: newOrder },
      });
    }

    // Mark cell as visited (processed) after exploring all neighbors
    visited[r][c] = true;
    curCell = null;
  }

  // --- Done ---
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
  doneScene.overlays.push({
    kind: "caption" as const,
    id: "dfs:result-label",
    x: GRID_X0 + cols / 2 - 0.5,
    y: GRID_Y0 - 0.6,
    text: `Discovery order from (${startRow},${startCol})`,
    emphasis: "soft" as const,
  });

  frames.push({
    id: `dfs.done.${stepNo++}`,
    kind: "done",
    codeToken: "dfs.done",
    narrationToken: "dfs.done",
    scene: doneScene,
    focus: {
      nodes: reachableIds,
    },
    meta: { totalVisited },
  });

  return frames;
}
