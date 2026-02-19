export const BUBBLE_SORT_TS =
` [[bs.init]]export function bubbleSort(a: number[]): number[] {[[/bs.init]]
   const n = a.length;
   [[bs.pass_start]]for (let i = 0; i < n - 1; i++) {[[/bs.pass_start]]
     for (let j = 0; j < n - i - 1; j++) {
       [[bs.compare]]if (a[j] > a[j + 1]) {[[/bs.compare]]
         [[bs.swap]][a[j], a[j + 1]] = [a[j + 1], a[j]];[[/bs.swap]]
       }[[bs.no_swap]] /* else: already in order */[[/bs.no_swap]]
     }
     [[bs.pass_done]]// end of pass[[/bs.pass_done]]
   }
   [[bs.done]]return a;[[/bs.done]]
 }`;

export const BUBBLE_SORT_TS_POINTER_HINTS = {
  "bs.compare": ["j", "j+1"],
  "bs.swap": ["j", "j+1"],
  "bs.no_swap": ["j", "j+1"],
  "bs.pass_done": ["sorted"],
} as const satisfies Record<string, string[]>;

export const BUBBLE_SORT_TS_POINTER_LABELS = {
  j: "j",
  "j+1": "j+1",
  sorted: "sorted",
} as const satisfies Record<string, string>;
