import type { NarrationBundle, NarrationMode } from "../../../../types/algo-types";

function pickMode(
  mode: NarrationMode,
  m: { explain: string; code: string; minimal: string }
) {
  return m[mode] ?? m.explain;
}

type Meta = Record<string, unknown>;

function n(meta: Meta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === "number" ? v : undefined;
}

export const INSERTION_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error(
          "InsertionSort narration: resolve() called without a token."
        );
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const i = n(meta, "i");
    const j = n(meta, "j");
    const key = n(meta, "key");
    const valJ = n(meta, "valJ");
    const insertPos = n(meta, "insertPos");

    switch (token) {
      case "is.init":
        return pickMode(mode, {
          explain:
            "Start Insertion Sort: build the sorted array one element at a time by inserting each value into its correct position.",
          code: "insertionSort(a);",
          minimal: "start",
        });

      case "is.pick":
        return pickMode(mode, {
          explain:
            typeof i === "number" && typeof key === "number"
              ? `Pick a[${i}] = ${key} as the key to insert into the sorted portion.`
              : "Pick the next element as the key to insert.",
          code: `key = a[${i ?? "?"}]; // ${key ?? "?"}`,
          minimal: `pick ${key ?? "?"}`,
        });

      case "is.compare":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof j === "number" &&
            typeof key === "number"
              ? valJ > key
                ? `a[${j}] = ${valJ} > ${key} — need to shift right.`
                : `a[${j}] = ${valJ} \u2264 ${key} — insertion point found.`
              : "Compare key with the next sorted element.",
          code: `a[${j ?? "?"}] > key \u2192 ${valJ ?? "?"} > ${key ?? "?"}`,
          minimal: "cmp",
        });

      case "is.shift":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof j === "number" &&
            typeof key === "number"
              ? `${valJ} > ${key} \u2192 shift a[${j}] right to a[${j + 1}].`
              : "Shift element right to make room.",
          code: `a[${(j ?? 0) + 1}] = a[${j ?? "?"}];`,
          minimal: "shift",
        });

      case "is.insert":
        return pickMode(mode, {
          explain:
            typeof key === "number" && typeof insertPos === "number"
              ? `Insert key ${key} at position ${insertPos}.`
              : "Insert the key into the gap.",
          code: `a[${insertPos ?? "?"}] = key;`,
          minimal: "insert",
        });

      case "is.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return a;",
          minimal: "sorted",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(
            `Missing insertion-sort narration for token: ${token}`
          );
        }
        return token;
      }
    }
  },
};

export default INSERTION_SORT_NARRATION;
