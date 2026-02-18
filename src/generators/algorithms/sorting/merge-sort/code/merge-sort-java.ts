// src/generators/algorithms/merge-sort/code/merge-sort.java.ts
export const MERGE_SORT_JAVA =
` import java.util.Arrays;

 class MergeSort {
   [[ms.init]]static void mergeSort(int[] a, int lo, int hi)[[/ms.init]] {
     [[ms.base_return]]if (lo >= hi) {
       return;
     }[[/ms.base_return]]

     [[ms.split]]int mid = lo + (hi - lo) / 2;[[/ms.split]]

     [[ms.recurse_left]]mergeSort(a, lo, mid);[[/ms.recurse_left]]
     [[ms.recurse_right]]mergeSort(a, mid + 1, hi);[[/ms.recurse_right]]

     [[ms.return]]merge(a, lo, mid, hi);[[/ms.return]]
   }

   [[ms.merge_start]]static void merge(int[] a, int lo, int mid, int hi) {
     int[] temp = Arrays.copyOfRange(a, lo, hi + 1);

     int i = 0;                 // left pointer (temp)
     int j = mid - lo + 1;      // right pointer (temp)
     int k = lo;                // write pointer (a)[[/ms.merge_start]]

     while (i <= mid - lo && j <= hi - lo) {
       [[ms.merge_compare]]if (temp[i] <= temp[j])[[/ms.merge_compare]] {
         [[ms.merge_write_left]]a[k] = temp[i];
         i++;[[/ms.merge_write_left]]
       } else {
         [[ms.merge_write_right]]a[k] = temp[j];
         j++;[[/ms.merge_write_right]]
       }
       k++;
     }

     [[ms.merge_write_remaining_left]]while (i <= mid - lo) {
       a[k] = temp[i];
       i++;
       k++;
     }[[/ms.merge_write_remaining_left]]
     [[ms.merge_done]]// right half leftovers are already in place[[/ms.merge_done]]
   }
 }
`;


export const MERGE_SORT_JAVA_POINTER_HINTS = {
  "ms.merge_start": ["i", "j", "k"],
  "ms.merge_compare": ["i", "j", "k"],
  "ms.merge_write_left": ["i", "j", "k"],
  "ms.merge_write_right": ["i", "j", "k"],
  "ms.merge_write_remaining_left": ["i", "k"],
  "ms.merge_done": [],
} as const satisfies Record<string, string[]>;


export const MERGE_SORT_JAVA_SKELETON =
`import java.util.Arrays;

class MergeSort {

  // Implement merge sort
  static void mergeSort(int[] a, int lo, int hi) {
    // your code here
  }

  // Optional helper
  static void merge(int[] a, int lo, int mid, int hi) {
    // your code here
  }
}
`;

