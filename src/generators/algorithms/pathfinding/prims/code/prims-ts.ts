export const PRIMS_TS =
`// Prim's MST: grow a minimum spanning tree from source
// Greedy: always pick the lightest edge crossing the cut

type Adj = Map<number, [number, number][]>;

class Prim {
  private minKeyVertex(
    key: number[], inMST: Set<number>, V: number,
  ): number {
    let u = -1;
    let best = Infinity;
    [[prim.pick.scan]]for (let i = 0; i < V; i++) {[[/prim.pick.scan]]
      [[prim.pick.check]]if (!inMST.has(i) && key[i] < best) {[[/prim.pick.check]]
        [[prim.pick.best]]u = i; best = key[i];[[/prim.pick.best]]
      }
    }
    return u;
  }

  solve(V: number, adj: Adj, src: number) {

    [[prim.init.key]]const key = Array(V).fill(Infinity);[[/prim.init.key]]
    [[prim.init.parent]]const parent: (number | null)[] = Array(V).fill(null);[[/prim.init.parent]]
    [[prim.init.mst]]const inMST = new Set<number>();[[/prim.init.mst]]

    [[prim.source]]key[src] = 0;[[/prim.source]]

    [[prim.loop]]while (inMST.size < V) {[[/prim.loop]]

      [[prim.pick]]const u = this.minKeyVertex(key, inMST, V);[[/prim.pick]]

      [[prim.add]]inMST.add(u);[[/prim.add]]

      [[prim.neighbors]]for (const [v, w] of adj.get(u)!) {[[/prim.neighbors]]

        [[prim.check]]if (!inMST.has(v)) {[[/prim.check]]

          [[prim.relax]]if (w < key[v]) {[[/prim.relax]]

            [[prim.update.key]]key[v] = w;[[/prim.update.key]]
            [[prim.update.parent]]parent[v] = u;[[/prim.update.parent]]
          }
        }
      }
    }

    [[prim.done]]return { key, parent };[[/prim.done]]
  }
}`;

export const PRIMS_TS_POINTER_HINTS = {
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

export const PRIMS_TS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
