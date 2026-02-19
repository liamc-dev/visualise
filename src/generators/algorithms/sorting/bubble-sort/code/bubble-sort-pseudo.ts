export const BUBBLE_SORT_PSEUDO =
` [[bs.init]]function bubbleSort(a, n):[[/bs.init]]
   [[bs.pass_start]]for i = 0 to n - 2:[[/bs.pass_start]]
     for j = 0 to n - i - 2:
       [[bs.compare]]if a[j] > a[j + 1]:[[/bs.compare]]
         [[bs.swap]]swap a[j] with a[j + 1][[/bs.swap]]
       [[bs.no_swap]]else: skip[[/bs.no_swap]]
     [[bs.pass_done]]// end of pass — a[n-i-1] is in place[[/bs.pass_done]]
   [[bs.done]]return a[[/bs.done]]
`;

export const BUBBLE_SORT_PSEUDO_POINTER_HINTS = {
  "bs.compare": ["j", "j+1"],
  "bs.swap": ["j", "j+1"],
  "bs.no_swap": ["j", "j+1"],
  "bs.pass_done": ["sorted"],
} as const satisfies Record<string, string[]>;

export const BUBBLE_SORT_PSEUDO_POINTER_LABELS = {
  j: "j",
  "j+1": "j+1",
  sorted: "sorted",
} as const satisfies Record<string, string>;
