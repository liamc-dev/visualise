import type { AlgorithmStep } from "../../utils/types";

export function bubbleSortSteps(arr: number[]): AlgorithmStep<number[]>[] {
  const a = [...arr];
  const steps: AlgorithmStep<number[]>[] = [];

  steps.push({
    state: [...a],
    description: "Initial array",
    highlight: [],
  });

  const n = a.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        state: [...a],
        description: `Compare indices ${j} and ${j + 1}`,
        highlight: [j, j + 1],
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          state: [...a],
          description: `Swap indices ${j} and ${j + 1}`,
          highlight: [j, j + 1],
        });
      }
    }
  }

  steps.push({
    state: [...a],
    description: "Sorted array",
    highlight: [],
  });

  return steps;
}
