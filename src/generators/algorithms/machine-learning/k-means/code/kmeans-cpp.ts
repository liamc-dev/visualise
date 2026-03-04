export const KMEANS_CPP =
` #include <vector>
 #include <cmath>
 using std::vector;

 // K-Means Clustering
 // Partition n points into k clusters

 double dist(vector<double>& a, vector<double>& b) {
   return hypot(a[0] - b[0], a[1] - b[1]);
 }

 [[km.data]]vector<int> kmeans(vector<vector<double>>& pts,
     int k, int maxIter) {[[/km.data]]
   int n = pts.size();
   [[km.init]]set<int> pick; srand(time(0));
   while ((int)pick.size() < k) pick.insert(rand() % n);
   vector<vector<double>> centroids(k);[[/km.init]]
   int ci = 0; for (int i : pick) centroids[ci++] = pts[i];
   vector<int> assign(n, -1);

   [[km.iteration]]for (int it = 0; it < maxIter; it++) {[[/km.iteration]]

     [[km.assign]]int changes = 0;[[/km.assign]]
     for (int i = 0; i < n; i++) {
       [[km.assign.init]]int nearest = 0; double bestD = 1e18;[[/km.assign.init]]
       for (int j = 0; j < k; j++) {
         [[km.assign.cmp]]double d = dist(pts[i], centroids[j]);
         if (d < bestD) { bestD = d; nearest = j; }[[/km.assign.cmp]]
       }
       [[km.assign.update]]if (assign[i] != nearest) {
         assign[i] = nearest; changes++;
       }[[/km.assign.update]]
     }

     [[km.update]]for (int j = 0; j < k; j++) {[[/km.update]]
       [[km.update.init]]double sx = 0, sy = 0; int cnt = 0;[[/km.update.init]]
       for (int i = 0; i < n; i++) {
         [[km.update.acc]]if (assign[i] == j) {
           sx += pts[i][0]; sy += pts[i][1]; cnt++;
         }[[/km.update.acc]]
       }
       [[km.update.mean]]if (cnt) {
         centroids[j][0] = sx / cnt; centroids[j][1] = sy / cnt;
       }[[/km.update.mean]]
     }

     [[km.check]]if (changes == 0) break;[[/km.check]]
   }

   [[km.done]]return assign;[[/km.done]]
 }
`;

export const KMEANS_CPP_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KMEANS_CPP_POINTER_LABELS = {} as const satisfies Record<string, string>;
