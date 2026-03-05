export const KNN_TS =
` // K-Nearest Neighbors (Leave-One-Out)

 function dist(a: number[], b: number[]): number {
   return Math.hypot(a[0] - b[0], a[1] - b[1]);
 }

 [[knn.data]]function knnLoo(
     points: number[][], labels: number[], k: number
 ): number {[[/knn.data]]
   [[knn.label]]const n = points.length;
   let correct = 0;[[/knn.label]]

   for (let qi = 0; qi < n; qi++) {
     [[knn.query]]const query = points[qi];[[/knn.query]]
     [[knn.dist.init]]const dists: { idx: number; d: number }[] = [];[[/knn.dist.init]]
     for (let j = 0; j < n; j++) {
       [[knn.dist.calc]]if (j !== qi)
         dists.push({ idx: j, d: dist(query, points[j]) });[[/knn.dist.calc]]
     }

     [[knn.sort]]dists.sort((a, b) => a.d - b.d);[[/knn.sort]]
     [[knn.select]]const neighbors = dists.slice(0, k);[[/knn.select]]

     [[knn.vote]]const votes = [0, 0];
     for (const nb of neighbors) votes[labels[nb.idx]]++;[[/knn.vote]]
     [[knn.decide]]const predicted = votes[1] > votes[0] ? 1 : 0;[[/knn.decide]]

     [[knn.predict]]if (predicted === labels[qi]) correct++;[[/knn.predict]]
   }

   [[knn.done]]return correct / n;[[/knn.done]]
 }
`;

export const KNN_TS_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KNN_TS_POINTER_LABELS = {} as const satisfies Record<string, string>;
