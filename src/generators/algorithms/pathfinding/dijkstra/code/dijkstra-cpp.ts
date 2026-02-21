export const DIJKSTRA_CPP =
`// grid[r][c] = cost to enter cell (0 = wall)
#include <vector>
#include <climits>
using namespace std;

int DIRS[4][2] = {{0,1},{1,0},{0,-1},{-1,0}};

pair<int,int> minDistCell(
    vector<vector<int>>& dist,
    vector<vector<bool>>& visited,
    int rows, int cols) {
  int r = -1, c = -1, best = INT_MAX;
  for (int ri = 0; ri < rows; ri++)
    for (int ci = 0; ci < cols; ci++)
      if (!visited[ri][ci] && dist[ri][ci] < best)
        { r = ri; c = ci; best = dist[ri][ci]; }
  return {r, c};
}


void dijkstra(vector<vector<int>>& grid,
              int sr, int sc) {
  int rows = grid.size();
  int cols = grid[0].size();

  [[dj.init.dist]]vector<vector<int>> dist(
    rows, vector<int>(cols, INT_MAX));[[/dj.init.dist]]
  [[dj.init.visited]]vector<vector<bool>> visited(
    rows, vector<bool>(cols, false));[[/dj.init.visited]]
  [[dj.init.setdist]]dist[sr][sc] = 0;[[/dj.init.setdist]]

  [[dj.loop]]for (int i = 0; i < rows * cols; i++) {[[/dj.loop]]
    [[dj.pick]]auto [r, c] = minDistCell(dist, visited, rows, cols);[[/dj.pick]]
    [[dj.pick]]if (dist[r][c] == INT_MAX) break;[[/dj.pick]]

    [[dj.neighbors]]for (auto& d : DIRS) {[[/dj.neighbors]]
      [[dj.neighbors]]int nr = r + d[0], nc = c + d[1];[[/dj.neighbors]]
      if (nr < 0 || nr >= rows ||
          nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 0) continue;

      [[dj.check.visited]]if (visited[nr][nc]) continue;[[/dj.check.visited]]

      [[dj.relax]]int tentative = dist[r][c] + grid[nr][nc];[[/dj.relax]]
      [[dj.relax]]if (tentative < dist[nr][nc]) {[[/dj.relax]]
        [[dj.update]]dist[nr][nc] = tentative;[[/dj.update]]
      }
    }

    [[dj.visit]]visited[r][c] = true;[[/dj.visit]]
  }

  [[dj.done]]// dist[][] = shortest distances[[/dj.done]]
}`;

export const DIJKSTRA_CPP_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_CPP_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
