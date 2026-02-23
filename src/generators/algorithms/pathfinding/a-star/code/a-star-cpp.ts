export const ASTAR_CPP =
`// grid[r][c] = cost to enter cell (0 = wall)
// h(r,c) = Manhattan distance to goal
#include <vector>
#include <climits>
#include <cmath>
using namespace std;

int DIRS[4][2] = {{0,1},{1,0},{0,-1},{-1,0}};

pair<int,int> minFCell(
    vector<vector<int>>& f,
    vector<vector<bool>>& visited,
    int rows, int cols) {
  int r = -1, c = -1, best = INT_MAX;
  for (int ri = 0; ri < rows; ri++)
    for (int ci = 0; ci < cols; ci++)
      if (!visited[ri][ci] && f[ri][ci] < best)
        { r = ri; c = ci; best = f[ri][ci]; }
  return {r, c};
}


void aStar(vector<vector<int>>& grid,
           int sr, int sc, int gr, int gc) {
  int rows = grid.size();
  int cols = grid[0].size();
  auto h = [&](int r, int c) {
    return abs(r - gr) + abs(c - gc);
  };

  [[as.init.g]]vector<vector<int>> g(
    rows, vector<int>(cols, INT_MAX));[[/as.init.g]]
  [[as.init.f]]vector<vector<int>> f(
    rows, vector<int>(cols, INT_MAX));[[/as.init.f]]
  [[as.init.visited]]vector<vector<bool>> visited(
    rows, vector<bool>(cols, false));[[/as.init.visited]]
  [[as.init.setg]]g[sr][sc] = 0;[[/as.init.setg]]
  [[as.init.setg]]f[sr][sc] = h(sr, sc);[[/as.init.setg]]

  [[as.loop]]for (int i = 0; i < rows * cols; i++) {[[/as.loop]]
    [[as.pick]]auto [r, c] = minFCell(f, visited, rows, cols);[[/as.pick]]
    [[as.pick]]if (f[r][c] == INT_MAX) break;[[/as.pick]]

    [[as.goal]]if (r == gr && c == gc) break;[[/as.goal]]

    [[as.neighbors]]for (auto& d : DIRS) {[[/as.neighbors]]
      [[as.neighbors]]int nr = r + d[0], nc = c + d[1];[[/as.neighbors]]
      if (nr < 0 || nr >= rows ||
          nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 0) continue;

      [[as.check.visited]]if (visited[nr][nc]) continue;[[/as.check.visited]]

      [[as.relax]]int tentG = g[r][c] + grid[nr][nc];[[/as.relax]]
      [[as.relax]]if (tentG < g[nr][nc]) {[[/as.relax]]
        [[as.update]]g[nr][nc] = tentG;[[/as.update]]
        [[as.update]]f[nr][nc] = tentG + h(nr, nc);[[/as.update]]
      }
    }

    [[as.visit]]visited[r][c] = true;[[/as.visit]]
  }

  [[as.done]]// g[][] = shortest distances, path via prev[[/as.done]]
}`;

export const ASTAR_CPP_POINTER_HINTS = {
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

export const ASTAR_CPP_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
