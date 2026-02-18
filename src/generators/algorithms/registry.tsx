// src/generators/algorithms/registry.tsx
import type { ReactNode, ComponentType } from "react";
import type { Theme } from "../../stores/useThemeStore";
import type { TraceFrame } from "../../types/trace-types";

import type {
  CodeBundle,
  NarrationBundle,
} from "../../types/algo-types";


export type ThemedLogo = Partial<Record<Theme, string>>;

export type AlgorithmDef = {
  label: string;
  category: "Sorting" | "Pathfinding" | "Graphs" | "Other";
  trace?: (input: number[]) => TraceFrame[];
  description?: ReactNode;
  bullets?: string[];
  codeBundle: CodeBundle;
  narrationBundle?: NarrationBundle;
};

const modules = import.meta.glob("./**/*.def.{ts,tsx}", { eager: true });

/**
 * Extracts the algorithm id from a module path.
 *
 * Example:
 *   "./sorting/heap-sort/heap-sort.def.tsx" → "heap-sort"
 *
 * The id is derived from the filename by removing the
 * `.def.ts` / `.def.tsx` suffix. This keeps ids stable
 * regardless of folder structure changes.
 */
function idFromPath(path: string) {
  const file = path.split("/").pop();
  if (!file) throw new Error(`Invalid path: ${path}`);
  return file.replace(/\.def\.(ts|tsx)$/, "");
}

export const ALGORITHMS = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const id = idFromPath(path);
    const def = (mod as any).default;
    if (!def) throw new Error(`Missing default export in ${path}`);
    return [id, def];
  })
) as Record<string, AlgorithmDef>;

export type Algorithm = (keyof typeof ALGORITHMS) & string;

export type AlgorithmId = string & { readonly __brand: "AlgorithmId" };

export function toAlgorithmId(key: string): AlgorithmId | null {
  return key in ALGORITHMS ? (key as AlgorithmId) : null;
}
