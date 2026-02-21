export const DIJKSTRA_CPP =
`#include <vector>
#include <climits>

class Dijkstra {
public:
  static void dijkstra(
      std::vector<std::vector<std::pair<int,int>>>& adj, int src) {
    int n = adj.size();

    [[dj.init.dist]]std::vector<int> dist(n, INT_MAX);[[/dj.init.dist]]
    [[dj.init.prev]]std::vector<int> prev(n, -1);[[/dj.init.prev]]
    [[dj.init.visited]]std::vector<bool> visited(n, false);[[/dj.init.visited]]
    [[dj.init.setdist]]dist[src] = 0;[[/dj.init.setdist]]

    [[dj.loop]]for (int i = 0; i < n; i++) {[[/dj.loop]]
      [[dj.pick]]int u = minDist(dist, visited);[[/dj.pick]]

      [[dj.neighbors]]for (auto& [v, w] : adj[u]) {[[/dj.neighbors]]
        [[dj.check.visited]]if (visited[v]) {[[/dj.check.visited]]
          [[dj.check.visited]]continue;[[/dj.check.visited]]
        [[dj.check.visited]]}[[/dj.check.visited]]
        [[dj.relax]]if (dist[u] + w < dist[v]) {[[/dj.relax]]
          [[dj.update]]dist[v] = dist[u] + w;[[/dj.update]]
          [[dj.update]]prev[v] = u;[[/dj.update]]
        }
      }

      [[dj.visit]]visited[u] = true;[[/dj.visit]]
    }

    [[dj.done]]// dist[] and prev[] are populated[[/dj.done]]
  }
};`;

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
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
