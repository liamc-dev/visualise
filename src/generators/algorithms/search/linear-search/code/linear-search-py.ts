export const LINEAR_SEARCH_PY =
` [[lin.init]]def linear_search(a, target):[[/lin.init]]
   [[lin.check]]for i in range(len(a)):
     if a[i] == target:[[/lin.check]]
       [[lin.found]]return i[[/lin.found]]
     [[lin.next]]# no match, continue[[/lin.next]]
   [[lin.not_found]]return -1[[/lin.not_found]]
`;

export const LINEAR_SEARCH_PY_POINTER_HINTS = {
  "lin.check": ["i"],
  "lin.found": ["i"],
  "lin.next": ["i"],
} as const satisfies Record<string, string[]>;

export const LINEAR_SEARCH_PY_POINTER_LABELS = {
  i: "i",
} as const satisfies Record<string, string>;
