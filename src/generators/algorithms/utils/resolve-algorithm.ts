// src/generators/algorithms/resolve-algorithm.ts
import { ALGORITHMS } from "../registry";
import type { AlgorithmDef } from "../registry";

export function isBundledAlgorithm(key: string): boolean {
  return key in (ALGORITHMS as Record<string, unknown>);
}

export function resolveAlgorithm(key: string): AlgorithmDef | null {
  return (ALGORITHMS as Record<string, AlgorithmDef>)[key] ?? null;
}
