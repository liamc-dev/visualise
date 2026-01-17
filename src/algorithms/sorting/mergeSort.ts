//src\algorithms\sorting\mergeSort.ts
import { AlgorithmStep, MergeSortVisualState } from "../../utils/types";
import { ActiveNode } from "../../utils/types";

let ID = 1; // unique node id generator

export function mergeSortSteps(input: number[]): AlgorithmStep<MergeSortVisualState>[] {
  ID = 1;

  const arr = [...input];
  const steps: AlgorithmStep<MergeSortVisualState>[] = [];
  const stack: ActiveNode[] = [];

  const root: ActiveNode = {
    id: ID++,
    lo: 0,
    hi: arr.length - 1,
    depth: 0,
    phase: "start",
  };

  stack.push(root);
  add(steps, stack, arr, "Initial array");

  mergeSort(arr, 0, arr.length - 1, 0, steps, stack);
  return steps;
}

function add(
  steps: AlgorithmStep<MergeSortVisualState>[],
  stack: ActiveNode[],
  arr: number[],
  description: string,
  highlight: number[] = []
) {
  steps.push({
    state: {
      array: [...arr],               // full array snapshot
      nodes: stack.map(n => ({ ...n })), // clone stack
    },
    description,
    highlight,
  });
}

function mergeSort(
  arr: number[],
  left: number,
  right: number,
  depth: number,
  steps: AlgorithmStep<MergeSortVisualState>[],
  stack: ActiveNode[]
) {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);

  // SPLIT node
  stack.push({
    id: ID++,
    lo: left,
    hi: right,
    mid,
    depth,
    phase: "split",
  });
  add(steps, stack, arr, `Split [${left}, ${right}]`);

  // LEFT RECURSION
  stack.push({
    id: ID++,
    lo: left,
    hi: mid,
    mid,
    depth: depth + 1,
    phase: "recurse-left",
  });
  add(steps, stack, arr, `Recurse left: [${left}, ${mid}]`);

  mergeSort(arr, left, mid, depth + 1, steps, stack);

  // Pop left frame
  stack.pop();
  add(steps, stack, arr, "Return from left");

  // RIGHT RECURSION
  stack.push({
    id: ID++,
    lo: mid + 1,
    hi: right,
    mid,
    depth: depth + 1,
    phase: "recurse-right",
  });
  add(steps, stack, arr, `Recurse right: [${mid + 1}, ${right}]`);

  mergeSort(arr, mid + 1, right, depth + 1, steps, stack);

  // Pop right frame
  stack.pop();
  add(steps, stack, arr, "Return from right");

  // MERGE
  merge(arr, left, mid, right, depth, steps, stack);
}

function merge(
  arr: number[],
  left: number,
  mid: number,
  right: number,
  depth: number,
  steps: AlgorithmStep<MergeSortVisualState>[],
  stack: ActiveNode[]
) {
  let leftArr = arr.slice(left, mid + 1);
  let rightArr = arr.slice(mid + 1, right + 1);

  let i = 0,
    j = 0,
    k = left;

  while (i < leftArr.length && j < rightArr.length) {
    arr[k] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];

    const top = stack[stack.length - 1];
    top.phase = "write";

    add(steps, stack, arr, `Write ${arr[k]} at index ${k}`, [k]);
    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i++];

    const top = stack[stack.length - 1];
    top.phase = "write";

    add(steps, stack, arr, `Write leftover ${arr[k]} at index ${k}`, [k]);
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j++];

    const top = stack[stack.length - 1];
    top.phase = "write";

    add(steps, stack, arr, `Write leftover ${arr[k]} at index ${k}`, [k]);
    k++;
  }

  // merge complete → pop merge node
  stack.pop();
  add(steps, stack, arr, `Merge complete [${left}, ${right}]`);
}
