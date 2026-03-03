export const PRIMS_PSEUDO =
`// Prim's MST: grow a minimum spanning tree from source
// Greedy: always pick the lightest edge crossing the cut

function minKeyVertex(key, inMST, V):
   u = -1, best = \u221e
   [[prim.pick.scan]]for i = 0 to V - 1:[[/prim.pick.scan]]
     [[prim.pick.check]]if i not in inMST and key[i] < best:[[/prim.pick.check]]
       [[prim.pick.best]]u = i, best = key[i][[/prim.pick.best]]
   return u

function prim(V, adj, source):

   [[prim.init.key]]key = array(V, \u221e)[[/prim.init.key]]
   [[prim.init.parent]]parent = array(V, null)[[/prim.init.parent]]
   [[prim.init.mst]]inMST = {}[[/prim.init.mst]]

   [[prim.source]]key[source] = 0[[/prim.source]]

   [[prim.loop]]while |inMST| < V:[[/prim.loop]]

     [[prim.pick]]u = minKeyVertex(key, inMST, V)[[/prim.pick]]

     [[prim.add]]inMST.add(u)[[/prim.add]]

     [[prim.neighbors]]for (v, w) in adj[u]:[[/prim.neighbors]]

       [[prim.check]]if v not in inMST:[[/prim.check]]

         [[prim.relax]]if w < key[v]:[[/prim.relax]]

           [[prim.update.key]]key[v] = w[[/prim.update.key]]
           [[prim.update.parent]]parent[v] = u[[/prim.update.parent]]

   [[prim.done]]return key, parent[[/prim.done]]
`;

export const PRIMS_PSEUDO_POINTER_HINTS = {
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

export const PRIMS_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
