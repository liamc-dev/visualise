// src/generators/algorithms/sorting/counting-sort/code/counting-sort-java.ts

export const COUNTING_SORT_JAVA =
` import java.util.Arrays;

 class CountingSort {
   [[cs.init]]static void countingSort(int[] a) {[[/cs.init]]
     [[cs.init]]int k = Arrays.stream(a).max().getAsInt() + 1;[[/cs.init]]

     [[cs.count_init]]int[] count = new int[k];[[/cs.count_init]]
     int[] output = new int[a.length];

     [[cs.scan]]for (int i = 0; i < a.length; i++) {[[/cs.scan]]
       [[cs.count]]count[a[i]]++;[[/cs.count]]
     }

     [[cs.prefix_read]]for (int i = 1; i < k; i++) {[[/cs.prefix_read]]
       [[cs.prefix]]count[i] += count[i - 1];[[/cs.prefix]]
     }

     [[cs.read]]for (int i = a.length - 1; i >= 0; i--) {[[/cs.read]]
       [[cs.place]]output[count[a[i]] - 1] = a[i];[[/cs.place]]
       [[cs.place]]count[a[i]]--;[[/cs.place]]
     }

     [[cs.copy_back]]System.arraycopy(output, 0, a, 0, a.length);[[/cs.copy_back]]
   [[cs.done]]}[[/cs.done]]
 }
`;

export const COUNTING_SORT_JAVA_POINTER_HINTS = {
  "cs.scan": ["i"],
  "cs.count": ["i"],
  "cs.prefix_read": ["i"],
  "cs.prefix": ["i"],
  "cs.read": ["i"],
  "cs.place": ["i"],
} as const satisfies Record<string, string[]>;
