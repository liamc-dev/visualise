export const KNN_PSEUDO =
` // K-Nearest Neighbors (Leave-One-Out)
 // Classify each point by majority vote of k nearest

 function dist(a, b):
   return sqrt((a.x-b.x)\u00b2 + (a.y-b.y)\u00b2)

 [[knn.data]]function knn_loo(points, labels, k):[[/knn.data]]
   [[knn.label]]n = len(points)
   correct = 0[[/knn.label]]

   for qi in range(n):
     [[knn.query]]query = points[qi][[/knn.query]]
     [[knn.dist.init]]dists = [][[/knn.dist.init]]
     for j in range(n):
       [[knn.dist.calc]]if j \u2260 qi:
         dists.append((dist(query, points[j]), j))[[/knn.dist.calc]]

     [[knn.sort]]dists.sort()[[/knn.sort]]
     [[knn.select]]neighbors = dists[:k][[/knn.select]]

     [[knn.vote]]votes = count_classes(neighbors)[[/knn.vote]]
     [[knn.decide]]predicted = argmax(votes)[[/knn.decide]]

     [[knn.predict]]if predicted == labels[qi]:
       correct += 1[[/knn.predict]]

   [[knn.done]]return correct / n[[/knn.done]]
`;

export const KNN_PSEUDO_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KNN_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
