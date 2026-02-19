// src/lib/array-utils.ts

const MIN_LENGTH = 3;
const MAX_LENGTH = 24;
const MIN_VALUE = 1;
const MAX_VALUE = 99;

export type ParseResult =
  | { ok: true; values: number[] }
  | { ok: false; error: string };

/**
 * Parse a comma/space-separated string into a validated number[].
 * Enforces 3-30 elements, values 1-99, integers only.
 */
export function validateAndParse(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter at least 3 numbers" };

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);

  const values: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return { ok: false, error: `"${p}" is not a valid integer` };
    }
    if (n < MIN_VALUE || n > MAX_VALUE) {
      return { ok: false, error: `Values must be between ${MIN_VALUE} and ${MAX_VALUE}` };
    }
    values.push(n);
  }

  if (values.length < MIN_LENGTH) {
    return { ok: false, error: `Need at least ${MIN_LENGTH} elements` };
  }
  if (values.length > MAX_LENGTH) {
    return { ok: false, error: `Maximum ${MAX_LENGTH} elements allowed` };
  }

  return { ok: true, values };
}

/** Fisher-Yates in-place shuffle, returns the same array. */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate a random array of `size` values between `min` and `max`. */
export function generateRandomArray(
  size: number,
  min = MIN_VALUE,
  max = MAX_VALUE
): number[] {
  const range = max - min + 1;

  // If pool is large enough, pick unique values
  if (range >= size) {
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    fisherYatesShuffle(pool);
    return pool.slice(0, size);
  }

  // Fallback: random with possible duplicates
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * range) + min
  );
}
