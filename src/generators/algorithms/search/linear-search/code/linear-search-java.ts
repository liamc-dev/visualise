export const LINEAR_SEARCH_JAVA =
` [[lin.init]]static int linearSearch(int[] a, int target) {[[/lin.init]]
   [[lin.check]]for (int i = 0; i < a.length; i++) {
     if (a[i] == target) {[[/lin.check]]
       [[lin.found]]return i;[[/lin.found]]
     }
     [[lin.next]]// no match, continue[[/lin.next]]
   }
   [[lin.not_found]]return -1;[[/lin.not_found]]
 }`;

export const LINEAR_SEARCH_JAVA_POINTER_HINTS = {
  "lin.check": ["i"],
  "lin.found": ["i"],
  "lin.next": ["i"],
} as const satisfies Record<string, string[]>;

export const LINEAR_SEARCH_JAVA_POINTER_LABELS = {
  i: "i",
} as const satisfies Record<string, string>;
