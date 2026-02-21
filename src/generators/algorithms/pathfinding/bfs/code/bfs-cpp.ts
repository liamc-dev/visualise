export const BFS_CPP =
`#include <vector>
#include <queue>

class BFS {
public:
  static std::vector<std::vector<int>> bfs(
      std::vector<std::vector<int>>& grid, int sr, int sc) {
    int rows = grid.size();
    int cols = grid[0].size();
    int dirs[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    [[bfs.init.queue]]std::queue<std::pair<int,int>> q;[[/bfs.init.queue]]
    [[bfs.init.visited]]std::vector<std::vector<bool>> visited(
      rows, std::vector<bool>(cols, false));[[/bfs.init.visited]]
    [[bfs.init.level]]std::vector<std::vector<int>> level(
      rows, std::vector<int>(cols, -1));[[/bfs.init.level]]
    [[bfs.init.mark]]visited[sr][sc] = true;[[/bfs.init.mark]]
    [[bfs.init.setlevel]]level[sr][sc] = 0;[[/bfs.init.setlevel]]
    [[bfs.init.enqueue]]q.push({sr, sc});[[/bfs.init.enqueue]]

    [[bfs.loop]]while (!q.empty()) {[[/bfs.loop]]
      [[bfs.dequeue]]auto [r, c] = q.front(); q.pop();[[/bfs.dequeue]]

      [[bfs.check]]for (auto [dr, dc] : dirs) {[[/bfs.check]]
        [[bfs.check]]int nr = r + dr;[[/bfs.check]]
        [[bfs.check]]int nc = c + dc;[[/bfs.check]]

        [[bfs.oob]]if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {[[/bfs.oob]]
          [[bfs.oob]]continue;[[/bfs.oob]]
        [[bfs.oob]]}[[/bfs.oob]]
        [[bfs.wall]]if (grid[nr][nc] == 1) {[[/bfs.wall]]
          [[bfs.wall]]continue;[[/bfs.wall]]
        [[bfs.wall]]}[[/bfs.wall]]
        [[bfs.visited]]if (visited[nr][nc]) {[[/bfs.visited]]
          [[bfs.visited]]continue;[[/bfs.visited]]
        [[bfs.visited]]}[[/bfs.visited]]

        [[bfs.mark]]visited[nr][nc] = true;[[/bfs.mark]]
        [[bfs.setlevel]]level[nr][nc] = level[r][c] + 1;[[/bfs.setlevel]]
        [[bfs.enqueue]]q.push({nr, nc});[[/bfs.enqueue]]
      }
    }

    [[bfs.done]]return level;[[/bfs.done]]
  }
};`;

export const BFS_CPP_POINTER_HINTS = {
  "bfs.dequeue": ["cur"],
  "bfs.check": ["cur"],
  "bfs.oob": ["cur"],
  "bfs.wall": ["cur", "nb"],
  "bfs.visited": ["cur", "nb"],
  "bfs.mark": ["cur", "nb"],
  "bfs.setlevel": ["cur", "nb"],
  "bfs.enqueue": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const BFS_CPP_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
