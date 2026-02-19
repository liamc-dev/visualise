import { useEffect } from "react";

const STORAGE_KEY = "tn-last-algorithm";
const FALLBACK = "merge-sort";

/** Persists the current algorithm key to localStorage. */
export function useLastAlgorithm(algoKey: string) {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, algoKey);
  }, [algoKey]);
}

/** Returns the last-visited algorithm key, or the fallback. */
export function getLastAlgorithm(): string {
  return localStorage.getItem(STORAGE_KEY) || FALLBACK;
}
