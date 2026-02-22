// src/generators/algorithms/sorting/counting-sort/code/counting-sort-cpp.ts

export const COUNTING_SORT_CPP =
`  #include <vector>
  #include <algorithm>
  using std::vector;

  [[cs.init]]void countingSort(vector<int>& a) {[[/cs.init]]
    [[cs.init]]int k = *std::max_element(a.begin(), a.end()) + 1;[[/cs.init]]

    [[cs.count_init]]vector<int> count(k, 0);[[/cs.count_init]]
    vector<int> output(a.size(), 0);

    [[cs.scan]]for (size_t i = 0; i < a.size(); i++) {[[/cs.scan]]
      [[cs.count]]count[a[i]]++;[[/cs.count]]
    }

    [[cs.prefix_read]]for (int i = 1; i < k; i++) {[[/cs.prefix_read]]
      [[cs.prefix]]count[i] += count[i - 1];[[/cs.prefix]]
    }

    [[cs.read]]for (int i = a.size() - 1; i >= 0; i--) {[[/cs.read]]
      [[cs.place]]output[count[a[i]] - 1] = a[i];[[/cs.place]]
      [[cs.place]]count[a[i]]--;[[/cs.place]]
    }

    [[cs.copy_back]]a = output;[[/cs.copy_back]]
  [[cs.done]]}[[/cs.done]]
`;

export const COUNTING_SORT_CPP_POINTER_HINTS = {
  "cs.scan": ["i"],
  "cs.count": ["i"],
  "cs.prefix_read": ["i"],
  "cs.prefix": ["i"],
  "cs.read": ["i"],
  "cs.place": ["i"],
} as const satisfies Record<string, string[]>;

export const COUNTING_SORT_CPP_POINTER_LABELS = {} as const satisfies Record<string, string>;
