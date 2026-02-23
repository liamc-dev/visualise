export const LINEAR_SEARCH_TS =
` [[lin.init]]export function linearSearch(a: number[], target: number): number {[[/lin.init]]
   [[lin.check]]for (let i = 0; i < a.length; i++) {
     if (a[i] === target) {[[/lin.check]]
       [[lin.found]]return i;[[/lin.found]]
     }
     [[lin.next]]// no match, continue[[/lin.next]]
   }
   [[lin.not_found]]return -1;[[/lin.not_found]]
 }`;

export const LINEAR_SEARCH_TS_POINTER_HINTS = {
  "lin.check": ["i"],
  "lin.found": ["i"],
  "lin.next": ["i"],
} as const satisfies Record<string, string[]>;

export const LINEAR_SEARCH_TS_POINTER_LABELS = {
  i: "i",
} as const satisfies Record<string, string>;
