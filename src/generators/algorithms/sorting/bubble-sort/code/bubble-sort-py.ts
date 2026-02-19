export const BUBBLE_SORT_PY =
` [[bs.init]]def bubble_sort(a):[[/bs.init]]
   n = len(a)
   [[bs.pass_start]]for i in range(n - 1):[[/bs.pass_start]]
     for j in range(n - i - 1):
       [[bs.compare]]if a[j] > a[j + 1]:[[/bs.compare]]
         [[bs.swap]]a[j], a[j + 1] = a[j + 1], a[j][[/bs.swap]]
       [[bs.no_swap]]# else: already in order[[/bs.no_swap]]
     [[bs.pass_done]]# end of pass[[/bs.pass_done]]
   [[bs.done]]return a[[/bs.done]]
`;

export const BUBBLE_SORT_PY_POINTER_HINTS = {
  "bs.compare": ["j", "j+1"],
  "bs.swap": ["j", "j+1"],
  "bs.no_swap": ["j", "j+1"],
  "bs.pass_done": ["sorted"],
} as const satisfies Record<string, string[]>;

export const BUBBLE_SORT_PY_POINTER_LABELS = {
  j: "j",
  "j+1": "j+1",
  sorted: "sorted",
} as const satisfies Record<string, string>;
