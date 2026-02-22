export const SELECTION_SORT_TS =
` [[ss.init]]export function selectionSort(a: number[]): number[] {[[/ss.init]]
   const n = a.length;
   [[ss.search_start]]for (let i = 0; i < n - 1; i++) {[[/ss.search_start]]
     let min = i;
     for (let j = i + 1; j < n; j++) {
       [[ss.compare]]if (a[j] < a[min]) {[[/ss.compare]]
         [[ss.new_min]]min = j;[[/ss.new_min]]
       }
     }
     [[ss.swap]]if (min !== i) [a[i], a[min]] = [a[min], a[i]];[[/ss.swap]]
     [[ss.place_done]]// a[i] settled[[/ss.place_done]]
   }
   [[ss.done]]return a;[[/ss.done]]
 }`;

export const SELECTION_SORT_TS_POINTER_HINTS = {
  "ss.search_start": ["i", "min"],
  "ss.compare": ["j", "min"],
  "ss.new_min": ["j", "min"],
  "ss.swap": ["i", "min"],
  "ss.place_done": ["i"],
} as const satisfies Record<string, string[]>;

export const SELECTION_SORT_TS_POINTER_LABELS = {
  i: "i",
  j: "j",
  min: "min",
} as const satisfies Record<string, string>;
