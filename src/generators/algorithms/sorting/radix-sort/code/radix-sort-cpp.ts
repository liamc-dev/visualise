// src/generators/algorithms/sorting/radix-sort/code/radix-sort-cpp.ts

export const RADIX_SORT_CPP =
`  #include <vector>
  #include <algorithm>
  using std::vector;

  [[rx.init]]void radixSort(vector<int>& a) {[[/rx.init]]
    [[rx.init]]int maxVal = *std::max_element(a.begin(), a.end());[[/rx.init]]

    [[rx.digit_start]]for (int exp = 1; maxVal / exp > 0; exp *= 10) {[[/rx.digit_start]]
      vector<int> count(10, 0);
      vector<int> output(a.size(), 0);

      [[rx.extract]]for (size_t i = 0; i < a.size(); i++) {[[/rx.extract]]
        [[rx.extract]]int digit = (a[i] / exp) % 10;[[/rx.extract]]
        [[rx.count]]count[digit]++;[[/rx.count]]
      }

      [[rx.prefix]]for (int i = 1; i < 10; i++) {[[/rx.prefix]]
        [[rx.prefix]]count[i] += count[i - 1];[[/rx.prefix]]
      }

      [[rx.place]]for (int i = a.size() - 1; i >= 0; i--) {[[/rx.place]]
        [[rx.place]]int digit = (a[i] / exp) % 10;[[/rx.place]]
        [[rx.place]]output[count[digit] - 1] = a[i];[[/rx.place]]
        [[rx.place]]count[digit]--;[[/rx.place]]
      }

      [[rx.copy_back]]a = output;[[/rx.copy_back]]
    }
  [[rx.done]]}[[/rx.done]]
`;

export const RADIX_SORT_CPP_POINTER_HINTS = {
  "rx.extract": ["i"],
  "rx.count": ["i"],
  "rx.place": ["i"],
} as const satisfies Record<string, string[]>;

export const RADIX_SORT_CPP_POINTER_LABELS = {} as const satisfies Record<string, string>;
