export const SELECTION_SORT_PY =
` [[ss.init]]def selection_sort(a):[[/ss.init]]
   n = len(a)
   [[ss.search_start]]for i in range(n - 1):[[/ss.search_start]]
     min_idx = i
     for j in range(i + 1, n):
       [[ss.compare]]if a[j] < a[min_idx]:[[/ss.compare]]
         [[ss.new_min]]min_idx = j[[/ss.new_min]]
     [[ss.swap]]if min_idx != i: a[i], a[min_idx] = a[min_idx], a[i][[/ss.swap]]
     [[ss.place_done]]# a[i] settled[[/ss.place_done]]
   [[ss.done]]return a[[/ss.done]]
`;

export const SELECTION_SORT_PY_POINTER_HINTS = {
  "ss.search_start": ["i", "min"],
  "ss.compare": ["j", "min"],
  "ss.new_min": ["j", "min"],
  "ss.swap": ["i", "min"],
  "ss.place_done": ["i"],
} as const satisfies Record<string, string[]>;

export const SELECTION_SORT_PY_POINTER_LABELS = {
  i: "i",
  j: "j",
  min: "min",
} as const satisfies Record<string, string>;
