export const KMEANS_PSEUDO =
` // K-Means Clustering
 // Partition n points into k clusters

 function dist(a, b):
   return sqrt((a.x-b.x)² + (a.y-b.y)²)

 [[km.data]]function kmeans(points, k):[[/km.data]]
   [[km.init]]centroids = random_sample(points, k)[[/km.init]]
   assign = [-1] * n

   [[km.iteration]]for iter in range(max_iter):[[/km.iteration]]

     [[km.assign]]changes = 0[[/km.assign]]
     for i in range(n):
       [[km.assign.init]]nearest = 0, bestD = ∞[[/km.assign.init]]
       for j in range(k):
         [[km.assign.cmp]]d = dist(points[i], centroids[j])
         if d < bestD: bestD = d, nearest = j[[/km.assign.cmp]]
       [[km.assign.update]]if assign[i] ≠ nearest:
         assign[i] = nearest
         changes += 1[[/km.assign.update]]

     [[km.update]]for j in range(k):[[/km.update]]
       [[km.update.init]]sx = 0, sy = 0, cnt = 0[[/km.update.init]]
       for i in range(n):
         [[km.update.acc]]if assign[i] == j:
           sx += points[i].x
           sy += points[i].y, cnt += 1[[/km.update.acc]]
       [[km.update.mean]]if cnt > 0: centroid[j] = (sx/cnt, sy/cnt)[[/km.update.mean]]

     [[km.check]]if changes == 0: break[[/km.check]]

   [[km.done]]return assign, centroids[[/km.done]]
`;

export const KMEANS_PSEUDO_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KMEANS_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
