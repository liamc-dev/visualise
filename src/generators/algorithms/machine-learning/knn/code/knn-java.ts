export const KNN_JAVA =
` // K-Nearest Neighbors (Leave-One-Out)

 public class KNN {
   static double dist(double[] a, double[] b) {
     return Math.hypot(a[0] - b[0], a[1] - b[1]);
   }

   [[knn.data]]static double knnLoo(
       double[][] points, int[] labels, int k) {[[/knn.data]]
     [[knn.label]]int n = points.length;
     int correct = 0;[[/knn.label]]

     for (int qi = 0; qi < n; qi++) {
       [[knn.query]]double[] query = points[qi];[[/knn.query]]
       [[knn.dist.init]]double[][] dists = new double[n - 1][2];
       int di = 0;[[/knn.dist.init]]
       for (int j = 0; j < n; j++) {
         [[knn.dist.calc]]if (j != qi) {
           dists[di] = new double[]{dist(query, points[j]), j};
           di++;
         }[[/knn.dist.calc]]
       }

       [[knn.sort]]Arrays.sort(dists, 0, di,
           (a, b) -> Double.compare(a[0], b[0]));[[/knn.sort]]
       [[knn.select]]// take first k entries[[/knn.select]]

       [[knn.vote]]int[] votes = new int[2];
       for (int i = 0; i < k; i++)
         votes[labels[(int) dists[i][1]]]++;[[/knn.vote]]
       [[knn.decide]]int predicted =
           votes[1] > votes[0] ? 1 : 0;[[/knn.decide]]

       [[knn.predict]]if (predicted == labels[qi])
         correct++;[[/knn.predict]]
     }

     [[knn.done]]return (double) correct / n;[[/knn.done]]
   }
 }
`;

export const KNN_JAVA_POINTER_HINTS = {} as const satisfies Record<string, string[]>;

export const KNN_JAVA_POINTER_LABELS = {} as const satisfies Record<string, string>;
