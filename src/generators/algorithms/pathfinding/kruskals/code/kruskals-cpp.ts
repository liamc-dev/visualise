export const KRUSKALS_CPP =
`// Kruskal's MST: sort edges, greedily add if no cycle
// Union-Find detects whether two nodes share a component

#include <vector>
#include <algorithm>
using namespace std;

class Kruskal {
    int find(vector<int>& parent, int x) {
        [[kruskal.find.check]]while (parent[x] != x) {[[/kruskal.find.check]]
            [[kruskal.find.up]]x = parent[x];[[/kruskal.find.up]]
        }
        return x;
    }

public:
    vector<array<int,3>> solve(
            int V, vector<array<int,3>>& edges) {

        [[kruskal.sort]]sort(edges.begin(), edges.end(),
            [](auto& a, auto& b) { return a[2] < b[2]; });[[/kruskal.sort]]

        vector<int> parent(V);
        [[kruskal.dsu]]for (int i = 0; i < V; i++) parent[i] = i;[[/kruskal.dsu]]
        [[kruskal.mst]]vector<array<int,3>> mst;[[/kruskal.mst]]

        [[kruskal.loop]]for (auto& e : edges) {[[/kruskal.loop]]
            int u = e[0], v = e[1], w = e[2];

            [[kruskal.find]]int rootU = find(parent, u);[[/kruskal.find]]
            [[kruskal.find2]]int rootV = find(parent, v);[[/kruskal.find2]]

            [[kruskal.check]]if (rootU != rootV) {[[/kruskal.check]]

                [[kruskal.add]]mst.push_back(e);[[/kruskal.add]]
                [[kruskal.union]]parent[rootU] = rootV;[[/kruskal.union]]

            [[kruskal.skip]]} // else: same component, skip[[/kruskal.skip]]
        }

        [[kruskal.done]]return mst;[[/kruskal.done]]
    }
};`;

export const KRUSKALS_CPP_POINTER_HINTS = {
  "kruskal.loop": ["u", "v"],
  "kruskal.find": ["u", "v"],
  "kruskal.find.check": ["u", "v"],
  "kruskal.find.up": ["u", "v"],
  "kruskal.find2": ["u", "v"],
  "kruskal.check": ["u", "v"],
  "kruskal.add": ["u", "v"],
  "kruskal.union": ["u", "v"],
  "kruskal.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const KRUSKALS_CPP_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
