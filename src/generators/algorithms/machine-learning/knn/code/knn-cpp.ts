export const KNN_CPP =
` // K-Nearest Neighbors (Leave-One-Out)
 #include <cmath>
 #include <algorithm>
 #include <vector>

 double dist(double* a, double* b) {
   return hypot(a[0] - b[0], a[1] - b[1]);
 }

 [[knn.data]]double knnLoo(
     double pts[][2], int* labels, int n, int k) {[[/knn.data]]
   [[knn.label]]int correct = 0;[[/knn.label]]

   for (int qi = 0; qi < n; qi++) {
     [[knn.query]]double* query = pts[qi];[[/knn.query]]
     [[knn.dist.init]]vector<pair<double,int>> dists;[[/knn.dist.init]]
     for (int j = 0; j < n; j++) {
       [[knn.dist.calc]]if (j != qi)
         dists.push_back({dist(query, pts[j]), j});[[/knn.dist.calc]]
     }

     [[knn.sort]]sort(dists.begin(), dists.end());[[/knn.sort]]
     [[knn.select]]// take first k entries[[/knn.select]]

     [[knn.vote]]int votes[2] = {0, 0};
     for (int i = 0; i < k; i++)
       votes[labels[dists[i].second]]++;[[/knn.vote]]
     [[knn.decide]]int predicted =
         votes[1] > votes[0] ? 1 : 0;[[/knn.decide]]

     [[knn.predict]]if (predicted == labels[qi])
       correct++;[[/knn.predict]]
   }

   [[knn.done]]return (double)correct / n;[[/knn.done]]
 }
`;

export const KNN_CPP_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KNN_CPP_POINTER_LABELS = {} as const satisfies Record<string, string>;
