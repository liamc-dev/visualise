export const INSERTION_SORT_JAVA =
` [[is.init]]static void insertionSort(int[] a) {[[/is.init]]
   int n = a.length;
   [[is.pick]]for (int i = 1; i < n; i++) {
     int key = a[i];[[/is.pick]]
     int j = i - 1;
     [[is.compare]]while (j >= 0 && a[j] > key) {[[/is.compare]]
       [[is.shift]]a[j + 1] = a[j];
       j--;[[/is.shift]]
     }
     [[is.insert]]a[j + 1] = key;[[/is.insert]]
   }
   [[is.done]]// sorted[[/is.done]]
 }`;

export const INSERTION_SORT_JAVA_POINTER_HINTS = {
  "is.pick": ["i"],
  "is.compare": ["i", "j"],
  "is.shift": ["i", "j"],
  "is.insert": ["i"],
} as const satisfies Record<string, string[]>;

export const INSERTION_SORT_JAVA_POINTER_LABELS = {
  i: "i",
  j: "j",
  sorted: "sorted",
} as const satisfies Record<string, string>;
