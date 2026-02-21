// src/generators/algorithms/sorting/radix-sort/code/radix-sort-java.ts

export const RADIX_SORT_JAVA =
` import java.util.Arrays;

 class RadixSort {
   [[rx.init]]static void radixSort(int[] a) {[[/rx.init]]
     [[rx.init]]int max = Arrays.stream(a).max().getAsInt();[[/rx.init]]

     [[rx.digit_start]]for (int exp = 1; max / exp > 0; exp *= 10) {[[/rx.digit_start]]
       int[] count = new int[10];
       int[] output = new int[a.length];

       [[rx.extract]]for (int i = 0; i < a.length; i++) {[[/rx.extract]]
         [[rx.extract]]int digit = (a[i] / exp) % 10;[[/rx.extract]]
         [[rx.count]]count[digit]++;[[/rx.count]]
       }

       [[rx.prefix]]for (int i = 1; i < 10; i++) {[[/rx.prefix]]
         [[rx.prefix]]count[i] += count[i - 1];[[/rx.prefix]]
       }

       [[rx.place]]for (int i = a.length - 1; i >= 0; i--) {[[/rx.place]]
         [[rx.place]]int digit = (a[i] / exp) % 10;[[/rx.place]]
         [[rx.place]]output[count[digit] - 1] = a[i];[[/rx.place]]
         [[rx.place]]count[digit]--;[[/rx.place]]
       }

       [[rx.copy_back]]System.arraycopy(output, 0, a, 0, a.length);[[/rx.copy_back]]
     }
   [[rx.done]]}[[/rx.done]]
 }
`;

export const RADIX_SORT_JAVA_POINTER_HINTS = {
  "rx.extract": ["i"],
  "rx.count": ["i"],
  "rx.place": ["i"],
} as const satisfies Record<string, string[]>;
