export const KMEANS_JS =
` // K-Means Clustering
 // Partition n points into k clusters

 function dist(a, b) {
   return Math.hypot(a[0] - b[0], a[1] - b[1]);
 }

 [[km.data]]function kmeans(points, k, maxIter = 15) {[[/km.data]]
   const n = points.length;
   [[km.init]]const pick = new Set();
   while (pick.size < k) pick.add(Math.floor(Math.random() * n));
   const centroids = [...pick].map(i => [...points[i]]);[[/km.init]]
   const assign = new Array(n).fill(-1);

   [[km.iteration]]for (let it = 0; it < maxIter; it++) {[[/km.iteration]]

     [[km.assign]]let changes = 0;[[/km.assign]]
     for (let i = 0; i < n; i++) {
       [[km.assign.init]]let nearest = 0, bestD = Infinity;[[/km.assign.init]]
       for (let j = 0; j < k; j++) {
         [[km.assign.cmp]]const d = dist(points[i], centroids[j]);
         if (d < bestD) { bestD = d; nearest = j; }[[/km.assign.cmp]]
       }
       [[km.assign.update]]if (assign[i] !== nearest) {
         assign[i] = nearest; changes++;
       }[[/km.assign.update]]
     }

     [[km.update]]for (let j = 0; j < k; j++) {[[/km.update]]
       [[km.update.init]]let sx = 0, sy = 0, cnt = 0;[[/km.update.init]]
       for (let i = 0; i < n; i++) {
         [[km.update.acc]]if (assign[i] === j) {
           sx += points[i][0]; sy += points[i][1]; cnt++;
         }[[/km.update.acc]]
       }
       [[km.update.mean]]if (cnt) centroids[j] = [sx / cnt, sy / cnt];[[/km.update.mean]]
     }

     [[km.check]]if (changes === 0) break;[[/km.check]]
   }

   [[km.done]]return { assign, centroids };[[/km.done]]
 }
`;

export const KMEANS_JS_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KMEANS_JS_POINTER_LABELS = {} as const satisfies Record<string, string>;
