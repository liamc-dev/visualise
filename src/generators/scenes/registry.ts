import type { ReactNode } from "react";
import type { TraceFrame } from "../../types/trace-types";

export type SceneDef = {
  id: string;
  label: string;
  category: "System Design" | "Graphs" | "Other";
  trace: () => TraceFrame[];

  description?: ReactNode;
  bullets?: string[];

  // Optional: for right-panel param UI later
  // controls?: any;
};

const modules = import.meta.glob("./**/*.def.{ts,tsx}", { eager: true });

function idFromPath(path: string) {
  // ./system-design/file-upload-cdn/file-upload-cdn.def.tsx → file-upload-cdn
  const file = path
    .replace(/^\.\//, "")
    .replace(/\.def\.(ts|tsx)$/, ""); // system-design/file-upload-cdn/file-upload-cdn

  const parts = file.split("/");
  return parts[parts.length - 1]; // file-upload-cdn
}


/**
 * Builds the scene registry automatically from the filesystem.
 *
 * All `*.def.ts(x)` files are eagerly imported via Vite. Each file must
 * export a default scene definition (without an `id`). The scene `id`
 * is derived from the filename and injected here to keep identity
 * consistent and avoid manual registration.
 *
 * The result is a lookup object:
 *
 *   SCENES[id] -> SceneDef
 *
 * Duplicate ids are checked to prevent accidental conflicts.
 */

export const SCENES = (() => {
  const entries = Object.entries(modules).map(([path, mod]) => {
    const id = idFromPath(path);
    const def = (mod as any).default as Omit<SceneDef, "id">;
    if (!def) throw new Error(`Missing default export in ${path}`);
    return [id, { id, ...def }] as const;
  });

  const seen = new Set<string>();
  for (const [id] of entries) {
    if (seen.has(id)) throw new Error(`Duplicate scene id: ${id}`);
    seen.add(id);
  }

  return Object.fromEntries(entries) as Record<string, SceneDef>;
})();
