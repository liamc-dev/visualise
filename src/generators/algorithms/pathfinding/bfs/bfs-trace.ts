// src/generators/algorithms/pathfinding/bfs/bfs-trace.ts

import type {
  TraceFrame,
  TraceScene,
  TraceNode,
  TraceOverlay,
  TracePointer,
} from "../../../../types/trace-types";
import {
  decodeGridInput,
  DEFAULT_BFS_GRID,
  DIRECTIONS,
} from "../../../../lib/grid-utils";

/* Grid cell layout: x starts at GRID_X0, y starts at GRID_Y0 */
const GRID_X0 = 2;
const GRID_Y0 = 1;

/* Queue visualization layout (horizontal offsets are fixed) */
const CUR_NODE_X = 1.5;
const QUEUE_LABEL_X = 3;
const QUEUE_START_X = 4;
const QUEUE_SPACING = 1.2;
const QUEUE_MAX_VISIBLE = 6;

/* Helpers */

function cellX(c: number): number { return GRID_X0 + c; }
function cellY(r: number): number { return GRID_Y0 + r; }
function cellId(r: number, c: number): string { return `bfs:${r}:${c}`; }
function queueNodeId(i: number): string { return `bfs:q:${i}`; }

/* Trace generator */

export function bfsTrace(input: number[]): TraceFrame[] {
  // Decode input or fall back to defaults
  const encoded = input.length >= 4 || input.length === 66 ? input : DEFAULT_BFS_GRID;
  const { rows, cols, startRow, startCol, walls } = decodeGridInput(encoded);

  // Dynamic layout values
  const QUEUE_Y = GRID_Y0 + rows + 1;
  const BOUNDS = {
    minX: 0,
    minY: 0,
    maxX: GRID_X0 + cols + 2,
    maxY: QUEUE_Y + 2,
  };

  // BFS state
  const level: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );
  const discovered: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  const queue: [number, number][] = [];
  let curCell: [number, number] | null = null;
  let showResult = false;

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
        const lv = level[r][c];

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
          value = lv;
        } else if (showResult && isVisited) {
          tone = "accent";
          emphasis = undefined;
          value = lv;
        } else if (isCur) {
          tone = "warning";
          emphasis = undefined;
          value = lv;
        } else if (isVisited) {
          tone = "neutral";
          emphasis = "soft";
          value = lv;
        } else if (isDiscovered) {
          tone = "info";
          emphasis = undefined;
          value = lv;
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

    // Cur node (dequeued cell shown left of queue — warning tone matches the grid highlight)
    if (curCell) {
      const [cr, cc] = curCell;
      nodes.push({
        id: "bfs:cur",
        kind: "cell",
        pos: { x: CUR_NODE_X, y: QUEUE_Y },
        meta: {
          value: `${cr},${cc}`,
          tone: "warning" as const,
        },
      });
    }

    // Queue nodes (show up to QUEUE_MAX_VISIBLE)
    const visibleQueue = queue.slice(0, QUEUE_MAX_VISIBLE);
    for (let i = 0; i < visibleQueue.length; i++) {
      const [qr, qc] = visibleQueue[i];
      nodes.push({
        id: queueNodeId(i),
        kind: "cell",
        pos: { x: QUEUE_START_X + i * QUEUE_SPACING, y: QUEUE_Y },
        meta: {
          value: `${qr},${qc}`,
          tone: "info" as const,
        },
      });
    }

    // Captions
    const overlays: TraceOverlay[] = [];

    if (curCell) {
      overlays.push({
        kind: "caption" as const,
        id: "bfs:cur-label",
        x: 0.5,
        y: QUEUE_Y,
        text: "cur",
        emphasis: "soft" as const,
      });
    }

    overlays.push({
      kind: "caption" as const,
      id: "bfs:queue-label",
      x: QUEUE_LABEL_X,
      y: QUEUE_Y,
      text: "Queue",
      emphasis: "soft" as const,
    });

    // If queue is longer than visible, show "..." indicator
    if (queue.length > QUEUE_MAX_VISIBLE) {
      overlays.push({
        kind: "caption" as const,
        id: "bfs:queue-overflow",
        x: QUEUE_START_X + QUEUE_MAX_VISIBLE * QUEUE_SPACING,
        y: QUEUE_Y,
        text: `+${queue.length - QUEUE_MAX_VISIBLE}`,
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

    // Hide values on cells physically behind pointer badges.
    // The badge overlaps the adjacent cell in the pointer's lane direction.
    if (args.pointers?.length) {
      const behindIds = new Set<string>();
      for (const p of args.pointers) {
        if (p.target.kind !== "node") continue;
        const m = p.target.nodeId.match(/^bfs:(\d+):(\d+)$/);
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
      id: `bfs.${args.kind}.${stepNo++}`,
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

  // bfs.init.queue — Create queue
  push({
    kind: "init.queue",
    codeToken: "bfs.init.queue",
    narrationToken: "bfs.init.queue",
    meta: { sr: startRow, sc: startCol },
  });

  // bfs.init.visited — Create visited array
  push({
    kind: "init.visited",
    codeToken: "bfs.init.visited",
    narrationToken: "bfs.init.visited",
  });

  // bfs.init.level — Create level array
  push({
    kind: "init.level",
    codeToken: "bfs.init.level",
    narrationToken: "bfs.init.level",
  });

  // bfs.init.mark — Mark source as visited
  discovered[startRow][startCol] = true;
  push({
    kind: "init.mark",
    codeToken: "bfs.init.mark",
    narrationToken: "bfs.init.mark",
    focusNodes: [cellId(startRow, startCol)],
    meta: { sr: startRow, sc: startCol },
  });

  // bfs.init.setlevel — Set source level to 0
  level[startRow][startCol] = 0;
  push({
    kind: "init.setlevel",
    codeToken: "bfs.init.setlevel",
    narrationToken: "bfs.init.setlevel",
    focusNodes: [cellId(startRow, startCol)],
    meta: { sr: startRow, sc: startCol },
  });

  // bfs.init.enqueue — Enqueue source
  queue.push([startRow, startCol]);
  push({
    kind: "init.enqueue",
    codeToken: "bfs.init.enqueue",
    narrationToken: "bfs.init.enqueue",
    focusNodes: [cellId(startRow, startCol), queueNodeId(0)],
    meta: { sr: startRow, sc: startCol },
  });

  // --- Main loop ---
  while (queue.length > 0) {
    // bfs.loop — "Queue has N elements"
    push({
      kind: "loop",
      codeToken: "bfs.loop",
      narrationToken: "bfs.loop",
      focusNodes: queue.slice(0, QUEUE_MAX_VISIBLE).map((_, i) => queueNodeId(i)),
      meta: { queueSize: queue.length },
    });

    // bfs.dequeue — Dequeue front cell
    const [r, c] = queue.shift()!;
    curCell = [r, c];
    push({
      kind: "dequeue",
      codeToken: "bfs.dequeue",
      narrationToken: "bfs.dequeue",
      focusNodes: [cellId(r, c), "bfs:cur"],
      meta: { r, c, level: level[r][c] },
    });

    // Check each direction
    for (const [dr, dc, dirLabel] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;

      // bfs.check — Compute neighbor coordinates
      push({
        kind: "check",
        codeToken: "bfs.check",
        narrationToken: "bfs.check",
        focusNodes: [cellId(r, c)],
        meta: { r, c, nr, nc, dir: dirLabel },
      });

      // Bounds check — always emit frame
      const oob = nr < 0 || nr >= rows || nc < 0 || nc >= cols;
      push({
        kind: "oob",
        codeToken: "bfs.oob",
        narrationToken: "bfs.oob",
        focusNodes: oob ? [cellId(r, c)] : [cellId(r, c), cellId(nr, nc)],
        pointers: oob ? undefined : [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: oob ? "fail" : "pass" },
      });
      if (oob) continue;

      // Wall check — always emit frame
      const isWall = walls[nr][nc];
      push({
        kind: "wall",
        codeToken: "bfs.wall",
        narrationToken: "bfs.wall",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: isWall ? "fail" : "pass" },
      });
      if (isWall) continue;

      // Visited check — always emit frame
      const alreadyVisited = discovered[nr][nc];
      push({
        kind: "visited",
        codeToken: "bfs.visited",
        narrationToken: "bfs.visited",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, result: alreadyVisited ? "fail" : "pass" },
      });
      if (alreadyVisited) continue;

      // Discover: 3 separate frames (mark → setlevel → enqueue)
      const newLevel = level[r][c] + 1;

      // bfs.mark — Mark neighbor as visited
      discovered[nr][nc] = true;
      push({
        kind: "mark",
        codeToken: "bfs.mark",
        narrationToken: "bfs.mark",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel },
      });

      // bfs.setlevel — Set neighbor level
      level[nr][nc] = newLevel;
      push({
        kind: "setlevel",
        codeToken: "bfs.setlevel",
        narrationToken: "bfs.setlevel",
        focusNodes: [cellId(r, c), cellId(nr, nc)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, level: newLevel },
      });

      // bfs.enqueue — Enqueue neighbor
      queue.push([nr, nc]);
      const lastQueueIdx = Math.min(queue.length - 1, QUEUE_MAX_VISIBLE - 1);
      push({
        kind: "enqueue",
        codeToken: "bfs.enqueue",
        narrationToken: "bfs.enqueue",
        focusNodes: [cellId(r, c), cellId(nr, nc), queueNodeId(lastQueueIdx)],
        pointers: [nbPointer(nr, nc, dirLabel)],
        meta: { r, c, nr, nc, dir: dirLabel, level: newLevel },
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
    id: "bfs:result-label",
    x: GRID_X0 + cols / 2 - 0.5,
    y: GRID_Y0 - 0.6,
    text: `Shortest distances from (${startRow},${startCol})`,
    emphasis: "soft" as const,
  });

  frames.push({
    id: `bfs.done.${stepNo++}`,
    kind: "done",
    codeToken: "bfs.done",
    narrationToken: "bfs.done",
    scene: doneScene,
    focus: {
      nodes: reachableIds,
    },
    meta: { totalVisited },
  });

  return frames;
}
