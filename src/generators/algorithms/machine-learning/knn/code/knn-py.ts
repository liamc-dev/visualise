export const KNN_PY =
` # K-Nearest Neighbors (Leave-One-Out)
 import math

 def dist(a, b):
     return math.hypot(a[0] - b[0], a[1] - b[1])

 [[knn.data]]def knn_loo(points, labels, k):[[/knn.data]]
     [[knn.label]]n = len(points)
     correct = 0[[/knn.label]]

     for qi in range(n):
         [[knn.query]]query = points[qi][[/knn.query]]
         [[knn.dist.init]]dists = [][[/knn.dist.init]]
         for j in range(n):
             [[knn.dist.calc]]if j != qi:
                 dists.append((dist(query, points[j]), j))[[/knn.dist.calc]]

         [[knn.sort]]dists.sort()[[/knn.sort]]
         [[knn.select]]neighbors = dists[:k][[/knn.select]]

         [[knn.vote]]votes = [0, 0]
         for d, idx in neighbors:
             votes[labels[idx]] += 1[[/knn.vote]]
         [[knn.decide]]predicted = 1 if votes[1] > votes[0] else 0[[/knn.decide]]

         [[knn.predict]]if predicted == labels[qi]:
             correct += 1[[/knn.predict]]

     [[knn.done]]return correct / n[[/knn.done]]
`;

export const KNN_PY_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KNN_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
