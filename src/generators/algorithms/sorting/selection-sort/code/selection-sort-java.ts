export const SELECTION_SORT_JAVA =
` [[ss.init]]static void selectionSort(int[] a) {[[/ss.init]]
   int n = a.length;
   [[ss.search_start]]for (int i = 0; i < n - 1; i++) {[[/ss.search_start]]
     int min = i;
     for (int j = i + 1; j < n; j++) {
       [[ss.compare]]if (a[j] < a[min]) {[[/ss.compare]]
         [[ss.new_min]]min = j;[[/ss.new_min]]
       }
     }
     [[ss.swap]]if (min != i) { int t = a[i]; a[i] = a[min]; a[min] = t; }[[/ss.swap]]
     [[ss.place_done]]// a[i] settled[[/ss.place_done]]
   }
   [[ss.done]]// sorted[[/ss.done]]
 }`;

export const SELECTION_SORT_JAVA_POINTER_HINTS = {
  "ss.search_start": ["i", "min"],
  "ss.compare": ["j", "min"],
  "ss.new_min": ["j", "min"],
  "ss.swap": ["i", "min"],
  "ss.place_done": ["i"],
} as const satisfies Record<string, string[]>;

export const SELECTION_SORT_JAVA_POINTER_LABELS = {
  i: "i",
  j: "j",
  min: "min",
} as const satisfies Record<string, string>;
