export const KMEANS_JAVA =
` // K-Means Clustering
 // Partition n points into k clusters

 public class KMeans {
   static double dist(double[] a, double[] b) {
     return Math.hypot(a[0] - b[0], a[1] - b[1]);
   }

   [[km.data]]static int[] kmeans(double[][] points, int k,
       int maxIter) {[[/km.data]]
     int n = points.length;
     [[km.init]]Set<Integer> pick = new HashSet<>();
     while (pick.size() < k) pick.add((int)(Math.random() * n));
     double[][] centroids = new double[k][];[[/km.init]]
     int ci = 0; for (int idx : pick) centroids[ci++] = points[idx].clone();
     int[] assign = new int[n];
     Arrays.fill(assign, -1);

     [[km.iteration]]for (int it = 0; it < maxIter; it++) {[[/km.iteration]]

       [[km.assign]]int changes = 0;[[/km.assign]]
       for (int i = 0; i < n; i++) {
         [[km.assign.init]]int nearest = 0; double bestD = Double.MAX_VALUE;[[/km.assign.init]]
         for (int j = 0; j < k; j++) {
           [[km.assign.cmp]]double d = dist(points[i], centroids[j]);
           if (d < bestD) {
               bestD = d; nearest = j; }[[/km.assign.cmp]]
         }
         [[km.assign.update]]if (assign[i] != nearest) {
           assign[i] = nearest; changes++;
         }[[/km.assign.update]]
       }

       [[km.update]]for (int j = 0; j < k; j++) {[[/km.update]]
         [[km.update.init]]double sx = 0, sy = 0; int cnt = 0;[[/km.update.init]]
         for (int i = 0; i < n; i++) {
           [[km.update.acc]]if (assign[i] == j) {
             sx += points[i][0]; sy += points[i][1]; cnt++;
           }[[/km.update.acc]]
         }
         [[km.update.mean]]if (cnt > 0) {
           centroids[j][0] = sx / cnt; centroids[j][1] = sy / cnt;
         }[[/km.update.mean]]
       }

       [[km.check]]if (changes == 0) break;[[/km.check]]
     }

     [[km.done]]return assign;[[/km.done]]
   }
 }
`;

export const KMEANS_JAVA_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KMEANS_JAVA_POINTER_LABELS = {} as const satisfies Record<string, string>;
