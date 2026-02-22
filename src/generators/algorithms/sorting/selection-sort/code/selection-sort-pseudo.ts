export const SELECTION_SORT_PSEUDO =
` [[ss.init]]function selectionSort(a, n):[[/ss.init]]
   [[ss.search_start]]for i = 0 to n - 2:[[/ss.search_start]]
     min = i
     for j = i + 1 to n - 1:
       [[ss.compare]]if a[j] < a[min]:[[/ss.compare]]
         [[ss.new_min]]min = j[[/ss.new_min]]
     [[ss.swap]]if min ≠ i: swap a[i] with a[min][[/ss.swap]]
     [[ss.place_done]]// a[i] is now in its final position[[/ss.place_done]]
   [[ss.done]]return a[[/ss.done]]
`;

export const SELECTION_SORT_PSEUDO_POINTER_HINTS = {
  "ss.search_start": ["i", "min"],
  "ss.compare": ["j", "min"],
  "ss.new_min": ["j", "min"],
  "ss.swap": ["i", "min"],
  "ss.place_done": ["i"],
} as const satisfies Record<string, string[]>;

export const SELECTION_SORT_PSEUDO_POINTER_LABELS = {
  i: "i",
  j: "j",
  min: "min",
} as const satisfies Record<string, string>;
