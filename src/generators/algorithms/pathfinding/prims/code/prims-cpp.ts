export const PRIMS_CPP =
`// Prim's MST: grow a minimum spanning tree from source
// Greedy: always pick the lightest edge crossing the cut

#include <vector>
#include <climits>
using namespace std;

class Prim {
    int minKeyVertex(
            vector<int>& key, vector<bool>& inMST, int V) {
        int u = -1, best = INT_MAX;
        [[prim.pick.scan]]for (int i = 0; i < V; i++) {[[/prim.pick.scan]]
            [[prim.pick.check]]if (!inMST[i] && key[i] < best) {[[/prim.pick.check]]
                [[prim.pick.best]]u = i; best = key[i];[[/prim.pick.best]]
            }
        }
        return u;
    }

public:
    void solve(int V,
            vector<pair<int,int>> adj[], int src) {

        [[prim.init.key]]vector<int> key(V, INT_MAX);[[/prim.init.key]]
        [[prim.init.parent]]vector<int> parent(V, -1);[[/prim.init.parent]]
        [[prim.init.mst]]vector<bool> inMST(V, false);[[/prim.init.mst]]

        [[prim.source]]key[src] = 0;[[/prim.source]]

        [[prim.loop]]for (int count = 0; count < V; count++) {[[/prim.loop]]

            [[prim.pick]]int u = minKeyVertex(key, inMST, V);[[/prim.pick]]

            [[prim.add]]inMST[u] = true;[[/prim.add]]

            [[prim.neighbors]]for (auto& [v, w] : adj[u]) {[[/prim.neighbors]]

                [[prim.check]]if (!inMST[v]) {[[/prim.check]]

                    [[prim.relax]]if (w < key[v]) {[[/prim.relax]]

                        [[prim.update.key]]key[v] = w;[[/prim.update.key]]
                        [[prim.update.parent]]parent[v] = u;[[/prim.update.parent]]
                    }
                }
            }
        }

        [[prim.done]]// key[] and parent[] now hold MST[[/prim.done]]
    }
};`;

export const PRIMS_CPP_POINTER_HINTS = {
  "prim.loop": [],
  "prim.pick.scan": [],
  "prim.pick.check": [],
  "prim.pick.best": [],
  "prim.pick": ["u"],
  "prim.add": ["u"],
  "prim.neighbors": ["u", "v"],
  "prim.check": ["u", "v"],
  "prim.relax": ["u", "v"],
  "prim.update.key": ["u", "v"],
  "prim.update.parent": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const PRIMS_CPP_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
