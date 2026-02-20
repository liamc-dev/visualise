export const INSERTION_SORT_TS =
` [[is.init]]export function insertionSort(a: number[]): number[] {[[/is.init]]
   const n = a.length;
   [[is.pick]]for (let i = 1; i < n; i++) {
     const key = a[i];[[/is.pick]]
     let j = i - 1;
     [[is.compare]]while (j >= 0 && a[j] > key) {[[/is.compare]]
       [[is.shift]]a[j + 1] = a[j];
       j--;[[/is.shift]]
     }
     [[is.insert]]a[j + 1] = key;[[/is.insert]]
   }
   [[is.done]]return a;[[/is.done]]
 }`;

export const INSERTION_SORT_TS_POINTER_HINTS = {
  "is.pick": ["i"],
  "is.compare": ["i", "j"],
  "is.shift": ["i", "j"],
  "is.insert": ["i"],
} as const satisfies Record<string, string[]>;

export const INSERTION_SORT_TS_POINTER_LABELS = {
  i: "i",
  j: "j",
} as const satisfies Record<string, string>;
