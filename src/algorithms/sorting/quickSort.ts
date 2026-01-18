// src/algorithms/sorting/quickSort.ts
import {
  AlgorithmStep,
  QuickSortVisualState,
  QuickSortNode,
} from "../../utils/types";

let ID = 1; // unique node id generator

export function quickSortSteps(
  input: number[]
): AlgorithmStep<QuickSortVisualState>[] {
  ID = 1;

  const arr = [...input];
  const steps: AlgorithmStep<QuickSortVisualState>[] = [];
  const stack: QuickSortNode[] = [];

  const root: QuickSortNode = {
    id: ID++,
    lo: 0,
    hi: arr.length - 1,
    depth: 0,
    phase: "start",
  };

  stack.push(root);
  addStep(steps, stack, arr, "Initial array");

  quickSort(arr, 0, arr.length - 1, 0, steps, stack);
  return steps;
}

function addStep(
  steps: AlgorithmStep<QuickSortVisualState>[],
  stack: QuickSortNode[],
  arr: number[],
  description: string,
  highlight: number[] = []
) {
  steps.push({
    state: {
      array: [...arr],
      nodes: stack.map((n) => ({ ...n })),
    },
    description,
    highlight,
  });
}

function quickSort(
  arr: number[],
  left: number,
  right: number,
  depth: number,
  steps: AlgorithmStep<QuickSortVisualState>[],
  stack: QuickSortNode[]
) {
  if (left >= right) return;

  // PARTITION NODE
  const partitionNode: QuickSortNode = {
    id: ID++,
    lo: left,
    hi: right,
    depth,
    phase: "partition",
  };

  stack.push(partitionNode);
  addStep(steps, stack, arr, `Partition range [${left}, ${right}]`);

  // Partition around pivot
  const pivotIndex = partition(arr, left, right, depth, steps, stack);

  partitionNode.phase = "pivot-place";
  partitionNode.pivotIndex = pivotIndex;
  addStep(
    steps,
    stack,
    arr,
    `Partition complete → pivot ${arr[pivotIndex]}`,
    [pivotIndex]
  );

  // LEFT RECURSION
  if (left < pivotIndex - 1) {
    stack.push({
      id: ID++,
      lo: left,
      hi: pivotIndex - 1,
      depth: depth + 1,
      phase: "recurse-left",
    });

    addStep(steps, stack, arr, `Recurse left: [${left}, ${pivotIndex - 1}]`);

    quickSort(arr, left, pivotIndex - 1, depth + 1, steps, stack);

    stack.pop();
    addStep(steps, stack, arr, "Return from left partition");
  }

  // RIGHT RECURSION
  if (pivotIndex + 1 < right) {
    stack.push({
      id: ID++,
      lo: pivotIndex + 1,
      hi: right,
      depth: depth + 1,
      phase: "recurse-right",
    });

    addStep(steps, stack, arr, `Recurse right: [${pivotIndex + 1}, ${right}]`);

    quickSort(arr, pivotIndex + 1, right, depth + 1, steps, stack);

    stack.pop();
    addStep(steps, stack, arr, "Return from right partition");
  }

  // SUBARRAY SORTED
  stack.pop();
  addStep(steps, stack, arr, `Segment sorted [${left}, ${right}]`);
}

function partition(
  arr: number[],
  left: number,
  right: number,
  depth: number,
  steps: AlgorithmStep<QuickSortVisualState>[],
  stack: QuickSortNode[]
): number {
  const pivot = arr[right];
  let i = left;

  const top = stack[stack.length - 1];

  // Pivot selection
  top.phase = "pivot";
  top.pivotIndex = right;
  top.scanIndex = undefined;
  top.boundaryIndex = i;
  addStep(
    steps,
    stack,
    arr,
    `Choose pivot ${pivot} → [${right}]`,
    [right]
  );

  for (let j = left; j < right; j++) {
    const currentVal = arr[j];
    const relation = currentVal <= pivot ? "<=" : ">";

    // mark current j and i before compare
    top.phase = "compare";
    top.scanIndex = j;
    top.boundaryIndex = i;

    // 🔍 COMPARISON STEP: always highlight j + pivot
    addStep(
      steps,
      stack,
      arr,
      `Compare ${currentVal} [${j}] ${relation} pivot ${pivot} [${right}]`,
      [j, right]
    );

    if (currentVal <= pivot) {
      if (i !== j) {
        const leftVal = arr[i];
        const rightVal = arr[j];

        [arr[i], arr[j]] = [arr[j], arr[i]];

        top.phase = "swap";
        top.scanIndex = j;
        top.boundaryIndex = i;

        addStep(
          steps,
          stack,
          arr,
          `Swap ${leftVal} [${i}] with ${rightVal} [${j}]`,
          [i, j, right]
        );
      } else {
        top.phase = "swap";
        top.scanIndex = j;
        top.boundaryIndex = i;

        addStep(
          steps,
          stack,
          arr,
          `Keep ${currentVal} [${j}] on left side`,
          [j, right]
        );
      }

      i++;
      top.boundaryIndex = i;
    }
  }

  // place pivot in its final position
  if (i !== right) {
    const pivotVal = arr[right];

    [arr[i], arr[right]] = [arr[right], arr[i]];

    top.phase = "pivot-place";
    top.pivotIndex = i;
    top.scanIndex = undefined;
    top.boundaryIndex = i;

    addStep(
      steps,
      stack,
      arr,
      `Place pivot ${pivotVal} → [${i}]`,
      [i]
    );
  } else {
    top.scanIndex = undefined;
    top.boundaryIndex = i;
  }

  return i;
}
