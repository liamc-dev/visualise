export const KMEANS_PY =
` # K-Means Clustering
 # Partition n points into k clusters

 def dist(a, b):
     return ((a[0]-b[0])**2 + (a[1]-b[1])**2) ** 0.5

 [[km.data]]def kmeans(points, k, max_iter=15):[[/km.data]]
     n = len(points)
     [[km.init]]idx = random.sample(range(n), k)
     centroids = [list(points[i]) for i in idx][[/km.init]]
     assign = [-1] * n

     [[km.iteration]]for it in range(max_iter):[[/km.iteration]]

         [[km.assign]]changes = 0[[/km.assign]]
         for i in range(n):
             [[km.assign.init]]nearest, bestD = 0, float('inf')[[/km.assign.init]]
             for j in range(k):
                 [[km.assign.cmp]]d = dist(points[i], centroids[j])
                 if d < bestD: bestD, nearest = d, j[[/km.assign.cmp]]
             [[km.assign.update]]if assign[i] != nearest:
                 assign[i] = nearest
                 changes += 1[[/km.assign.update]]

         [[km.update]]for j in range(k):[[/km.update]]
             [[km.update.init]]sx, sy, cnt = 0, 0, 0[[/km.update.init]]
             for i in range(n):
                 [[km.update.acc]]if assign[i] == j:
                     sx += points[i][0]
                     sy += points[i][1]; cnt += 1[[/km.update.acc]]
             [[km.update.mean]]if cnt: centroids[j] = (sx/cnt, sy/cnt)[[/km.update.mean]]

         [[km.check]]if changes == 0:
             break[[/km.check]]

     [[km.done]]return assign, centroids[[/km.done]]
`;

export const KMEANS_PY_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KMEANS_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
