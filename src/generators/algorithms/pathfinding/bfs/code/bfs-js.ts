export const BFS_JS =
`const dirs = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function bfs(grid, sr, sc) {
  const rows = grid.length;
  const cols = grid[0].length;

  [[bfs.init.queue]]const queue = [];[[/bfs.init.queue]]
  [[bfs.init.visited]]const visited = Array.from(
    { length: rows }, () => Array(cols).fill(false)
  );[[/bfs.init.visited]]
  [[bfs.init.level]]const level = Array.from(
    { length: rows }, () => Array(cols).fill(-1)
  );[[/bfs.init.level]]
  [[bfs.init.mark]]visited[sr][sc] = true;[[/bfs.init.mark]]
  [[bfs.init.setlevel]]level[sr][sc] = 0;[[/bfs.init.setlevel]]
  [[bfs.init.enqueue]]queue.push([sr, sc]);[[/bfs.init.enqueue]]

  [[bfs.loop]]while (queue.length > 0) {[[/bfs.loop]]
    [[bfs.dequeue]]const [r, c] = queue.shift();[[/bfs.dequeue]]

    [[bfs.check]]for (const [dr, dc] of dirs) {[[/bfs.check]]
      [[bfs.check]]const nr = r + dr;[[/bfs.check]]
      [[bfs.check]]const nc = c + dc;[[/bfs.check]]

      [[bfs.oob]]if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {[[/bfs.oob]]
        [[bfs.oob]]continue;[[/bfs.oob]]
      [[bfs.oob]]}[[/bfs.oob]]
      [[bfs.wall]]if (grid[nr][nc] === 1) {[[/bfs.wall]]
        [[bfs.wall]]continue;[[/bfs.wall]]
      [[bfs.wall]]}[[/bfs.wall]]
      [[bfs.visited]]if (visited[nr][nc]) {[[/bfs.visited]]
        [[bfs.visited]]continue;[[/bfs.visited]]
      [[bfs.visited]]}[[/bfs.visited]]

      [[bfs.mark]]visited[nr][nc] = true;[[/bfs.mark]]
      [[bfs.setlevel]]level[nr][nc] = level[r][c] + 1;[[/bfs.setlevel]]
      [[bfs.enqueue]]queue.push([nr, nc]);[[/bfs.enqueue]]
    }
  }

  [[bfs.done]]return level;[[/bfs.done]]
}`;

export const BFS_JS_POINTER_HINTS = {
  "bfs.dequeue": ["cur"],
  "bfs.check": ["cur"],
  "bfs.oob": ["cur"],
  "bfs.wall": ["cur", "nb"],
  "bfs.visited": ["cur", "nb"],
  "bfs.mark": ["cur", "nb"],
  "bfs.setlevel": ["cur", "nb"],
  "bfs.enqueue": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const BFS_JS_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
