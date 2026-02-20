export const INSERTION_SORT_PSEUDO =
` [[is.init]]function insertionSort(a, n):[[/is.init]]
   [[is.pick]]for i = 1 to n - 1:
     key = a[i][[/is.pick]]
     j = i - 1
     [[is.compare]]while j >= 0 and a[j] > key:[[/is.compare]]
       [[is.shift]]a[j + 1] = a[j]
       j = j - 1[[/is.shift]]
     [[is.insert]]a[j + 1] = key[[/is.insert]]
   [[is.done]]return a[[/is.done]]
`;

export const INSERTION_SORT_PSEUDO_POINTER_HINTS = {
  "is.pick": ["i"],
  "is.compare": ["i", "j"],
  "is.shift": ["i", "j"],
  "is.insert": ["i"],
} as const satisfies Record<string, string[]>;

export const INSERTION_SORT_PSEUDO_POINTER_LABELS = {
  i: "i",
  j: "j",
} as const satisfies Record<string, string>;
