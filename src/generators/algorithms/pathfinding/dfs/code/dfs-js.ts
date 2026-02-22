export const DFS_JS =
`const dirs = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function dfs(grid, sr, sc) {
  const rows = grid.length;
  const cols = grid[0].length;

  [[dfs.init.stack]]const stack = [];[[/dfs.init.stack]]
  [[dfs.init.visited]]const visited = Array.from(
    { length: rows }, () => Array(cols).fill(false)
  );[[/dfs.init.visited]]
  [[dfs.init.order]]const order = Array.from(
    { length: rows }, () => Array(cols).fill(-1)
  );[[/dfs.init.order]]
  let count = 0;
  [[dfs.init.mark]]visited[sr][sc] = true;[[/dfs.init.mark]]
  [[dfs.init.setorder]]order[sr][sc] = ++count;[[/dfs.init.setorder]]
  [[dfs.init.push]]stack.push([sr, sc]);[[/dfs.init.push]]

  [[dfs.loop]]while (stack.length > 0) {[[/dfs.loop]]
    [[dfs.pop]]const [r, c] = stack.pop();[[/dfs.pop]]

    [[dfs.check]]for (const [dr, dc] of dirs) {[[/dfs.check]]
      [[dfs.check]]const nr = r + dr;[[/dfs.check]]
      [[dfs.check]]const nc = c + dc;[[/dfs.check]]

      [[dfs.oob]]if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {[[/dfs.oob]]
        [[dfs.oob]]continue;[[/dfs.oob]]
      [[dfs.oob]]}[[/dfs.oob]]
      [[dfs.wall]]if (grid[nr][nc] === 1) {[[/dfs.wall]]
        [[dfs.wall]]continue;[[/dfs.wall]]
      [[dfs.wall]]}[[/dfs.wall]]
      [[dfs.visited]]if (visited[nr][nc]) {[[/dfs.visited]]
        [[dfs.visited]]continue;[[/dfs.visited]]
      [[dfs.visited]]}[[/dfs.visited]]

      [[dfs.mark]]visited[nr][nc] = true;[[/dfs.mark]]
      [[dfs.setorder]]order[nr][nc] = ++count;[[/dfs.setorder]]
      [[dfs.push]]stack.push([nr, nc]);[[/dfs.push]]
    }
  }

  [[dfs.done]]return order;[[/dfs.done]]
}`;

export const DFS_JS_POINTER_HINTS = {
  "dfs.pop": ["cur"],
  "dfs.check": ["cur"],
  "dfs.oob": ["cur"],
  "dfs.wall": ["cur", "nb"],
  "dfs.visited": ["cur", "nb"],
  "dfs.mark": ["cur", "nb"],
  "dfs.setorder": ["cur", "nb"],
  "dfs.push": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const DFS_JS_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
