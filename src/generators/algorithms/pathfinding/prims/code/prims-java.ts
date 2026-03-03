export const PRIMS_JAVA =
`// Prim's MST: grow a minimum spanning tree from source
// Greedy: always pick the lightest edge crossing the cut

class Prim {
    private int minKeyVertex(
            int[] key, boolean[] inMST, int V) {
        int u = -1, best = Integer.MAX_VALUE;
        [[prim.pick.scan]]for (int i = 0; i < V; i++) {[[/prim.pick.scan]]
            [[prim.pick.check]]if (!inMST[i] && key[i] < best) {[[/prim.pick.check]]
                [[prim.pick.best]]u = i; best = key[i];[[/prim.pick.best]]
            }
        }
        return u;
    }

    int[] solve(int V, List<int[]>[] adj, int src) {

        int[] key = new int[V];
        int[] parent = new int[V];
        boolean[] inMST = new boolean[V];

        [[prim.init.key]]Arrays.fill(key, Integer.MAX_VALUE);[[/prim.init.key]]
        [[prim.init.parent]]Arrays.fill(parent, -1);[[/prim.init.parent]]
        [[prim.init.mst]]// inMST defaults to false[[/prim.init.mst]]

        [[prim.source]]key[src] = 0;[[/prim.source]]

        [[prim.loop]]for (int count = 0; count < V; count++) {[[/prim.loop]]

            [[prim.pick]]int u = minKeyVertex(key, inMST, V);[[/prim.pick]]

            [[prim.add]]inMST[u] = true;[[/prim.add]]

            [[prim.neighbors]]for (int[] e : adj[u]) {[[/prim.neighbors]]
                int v = e[0], w = e[1];

                [[prim.check]]if (!inMST[v]) {[[/prim.check]]

                    [[prim.relax]]if (w < key[v]) {[[/prim.relax]]

                        [[prim.update.key]]key[v] = w;[[/prim.update.key]]
                        [[prim.update.parent]]parent[v] = u;[[/prim.update.parent]]
                    }
                }
            }
        }

        [[prim.done]]return key;[[/prim.done]]
    }
}`;

export const PRIMS_JAVA_POINTER_HINTS = {
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

export const PRIMS_JAVA_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
