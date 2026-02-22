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

export const SELECTION_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("SelectionSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const i = n(meta, "i");
    const j = n(meta, "j");
    const min = n(meta, "min");
    const valJ = n(meta, "valJ");
    const valMin = n(meta, "valMin");
    const valI = n(meta, "valI");
    const value = n(meta, "value");

    switch (token) {
      case "ss.init":
        return pickMode(mode, {
          explain:
            "Start Selection Sort: repeatedly find the minimum in the unsorted portion and swap it into position.",
          code: "selectionSort(a);",
          minimal: "start",
        });

      case "ss.search_start":
        return pickMode(mode, {
          explain:
            typeof i === "number"
              ? `Begin pass ${i}: search for the smallest element from index ${i} onward.`
              : "Begin searching for the minimum in the unsorted portion.",
          code: `min = ${i ?? "?"}`,
          minimal: `pass ${i ?? "?"}`,
        });

      case "ss.compare":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof valMin === "number" &&
            typeof j === "number" &&
            typeof min === "number"
              ? `Compare a[${j}]=${valJ} with a[min=${min}]=${valMin}.`
              : "Compare current element with current minimum.",
          code: "if (a[j] < a[min]) ...",
          minimal: "cmp",
        });

      case "ss.new_min":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" && typeof j === "number"
              ? `${valJ} is smaller — update min to index ${j}.`
              : "Found a new minimum.",
          code: `min = ${j ?? "?"}`,
          minimal: "new min",
        });

      case "ss.swap":
        return pickMode(mode, {
          explain:
            typeof valI === "number" &&
            typeof valMin === "number" &&
            typeof i === "number" &&
            typeof min === "number"
              ? `Swap a[${i}]=${valI} with a[${min}]=${valMin} to place the minimum.`
              : "Swap the minimum into position.",
          code: "swap(a[i], a[min]);",
          minimal: "swap",
        });

      case "ss.place_done":
        return pickMode(mode, {
          explain:
            typeof i === "number" && typeof value === "number"
              ? `Position ${i} is settled: ${value} is now in its final place.`
              : "Position settled.",
          code: "// a[i] settled",
          minimal: "placed",
        });

      case "ss.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return a;",
          minimal: "sorted",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing selection-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default SELECTION_SORT_NARRATION;
