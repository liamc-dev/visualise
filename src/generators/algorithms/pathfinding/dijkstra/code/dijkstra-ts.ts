export const DIJKSTRA_TS =
`// grid[r][c] = cost to enter cell (0 = wall)
const DIRS: [number, number][] = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function minDistCell(
  dist: number[][], visited: boolean[][],
  rows: number, cols: number,
): [number, number] {
  let r = -1, c = -1, best = Infinity;
  for (let ri = 0; ri < rows; ri++)
    for (let ci = 0; ci < cols; ci++)
      if (!visited[ri][ci] && dist[ri][ci] < best)
        { r = ri; c = ci; best = dist[ri][ci]; }
  return [r, c];
}


function dijkstra(grid: number[][], sr: number, sc: number): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;

  [[dj.init.dist]]const dist: number[][] = Array.from({ length: rows },[[/dj.init.dist]]
    [[dj.init.dist]]() => Array(cols).fill(Infinity));[[/dj.init.dist]]
  [[dj.init.visited]]const visited: boolean[][] = Array.from({ length: rows },[[/dj.init.visited]]
    [[dj.init.visited]]() => Array(cols).fill(false));[[/dj.init.visited]]
  [[dj.init.setdist]]dist[sr][sc] = 0;[[/dj.init.setdist]]

  [[dj.loop]]for (let i = 0; i < rows * cols; i++) {[[/dj.loop]]
    [[dj.pick]]const [r, c] = minDistCell(dist, visited, rows, cols);[[/dj.pick]]
    [[dj.pick]]if (dist[r][c] === Infinity) break;[[/dj.pick]]

    [[dj.neighbors]]for (const [dr, dc] of DIRS) {[[/dj.neighbors]]
      [[dj.neighbors]]const nr = r + dr, nc = c + dc;[[/dj.neighbors]]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols)
        continue;
      if (grid[nr][nc] === 0) continue;

      [[dj.check.visited]]if (visited[nr][nc]) continue;[[/dj.check.visited]]

      [[dj.relax]]const tentative = dist[r][c] + grid[nr][nc];[[/dj.relax]]
      [[dj.relax]]if (tentative < dist[nr][nc]) {[[/dj.relax]]
        [[dj.update]]dist[nr][nc] = tentative;[[/dj.update]]
      }
    }

    [[dj.visit]]visited[r][c] = true;[[/dj.visit]]
  }

  [[dj.done]]return dist;[[/dj.done]]
}`;

export const DIJKSTRA_TS_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_TS_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
