export const LINEAR_SEARCH_PSEUDO =
` [[lin.init]]function linearSearch(a, n, target):[[/lin.init]]
   [[lin.check]]for i = 0 to n - 1:
     if a[i] == target:[[/lin.check]]
       [[lin.found]]return i[[/lin.found]]
     [[lin.next]]// no match, continue[[/lin.next]]
   [[lin.not_found]]return -1  // not found[[/lin.not_found]]
`;

export const LINEAR_SEARCH_PSEUDO_POINTER_HINTS = {
  "lin.check": ["i"],
  "lin.found": ["i"],
  "lin.next": ["i"],
} as const satisfies Record<string, string[]>;

export const LINEAR_SEARCH_PSEUDO_POINTER_LABELS = {
  i: "i",
} as const satisfies Record<string, string>;
