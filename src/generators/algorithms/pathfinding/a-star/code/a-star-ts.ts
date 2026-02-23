export const ASTAR_TS =
`// grid[r][c] = cost to enter cell (0 = wall)
// h(r,c) = Manhattan distance to goal
const DIRS: [number, number][] = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function minFCell(
  f: number[][], visited: boolean[][],
  rows: number, cols: number,
): [number, number] {
  let r = -1, c = -1, best = Infinity;
  for (let ri = 0; ri < rows; ri++)
    for (let ci = 0; ci < cols; ci++)
      if (!visited[ri][ci] && f[ri][ci] < best)
        { r = ri; c = ci; best = f[ri][ci]; }
  return [r, c];
}


function aStar(
  grid: number[][], sr: number, sc: number,
  gr: number, gc: number,
): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const h = (r: number, c: number) =>
    Math.abs(r - gr) + Math.abs(c - gc);

  [[as.init.g]]const g: number[][] = Array.from({ length: rows },[[/as.init.g]]
    [[as.init.g]]() => Array(cols).fill(Infinity));[[/as.init.g]]
  [[as.init.f]]const f: number[][] = Array.from({ length: rows },[[/as.init.f]]
    [[as.init.f]]() => Array(cols).fill(Infinity));[[/as.init.f]]
  [[as.init.visited]]const visited: boolean[][] = Array.from({ length: rows },[[/as.init.visited]]
    [[as.init.visited]]() => Array(cols).fill(false));[[/as.init.visited]]
  [[as.init.setg]]g[sr][sc] = 0;[[/as.init.setg]]
  [[as.init.setg]]f[sr][sc] = h(sr, sc);[[/as.init.setg]]

  [[as.loop]]for (let i = 0; i < rows * cols; i++) {[[/as.loop]]
    [[as.pick]]const [r, c] = minFCell(f, visited, rows, cols);[[/as.pick]]
    [[as.pick]]if (f[r][c] === Infinity) break;[[/as.pick]]

    [[as.goal]]if (r === gr && c === gc) break;[[/as.goal]]

    [[as.neighbors]]for (const [dr, dc] of DIRS) {[[/as.neighbors]]
      [[as.neighbors]]const nr = r + dr, nc = c + dc;[[/as.neighbors]]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols)
        continue;
      if (grid[nr][nc] === 0) continue;

      [[as.check.visited]]if (visited[nr][nc]) continue;[[/as.check.visited]]

      [[as.relax]]const tentG = g[r][c] + grid[nr][nc];[[/as.relax]]
      [[as.relax]]if (tentG < g[nr][nc]) {[[/as.relax]]
        [[as.update]]g[nr][nc] = tentG;[[/as.update]]
        [[as.update]]f[nr][nc] = tentG + h(nr, nc);[[/as.update]]
      }
    }

    [[as.visit]]visited[r][c] = true;[[/as.visit]]
  }

  [[as.done]]return g;[[/as.done]]
}`;

export const ASTAR_TS_POINTER_HINTS = {
  "as.loop": ["u"],
  "as.pick": ["u"],
  "as.goal": ["u"],
  "as.neighbors": ["u", "v"],
  "as.check.visited": ["u", "v"],
  "as.relax": ["u", "v"],
  "as.update": ["u", "v"],
  "as.skip": ["u", "v"],
  "as.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const ASTAR_TS_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
