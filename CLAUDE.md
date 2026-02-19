# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Algorithm visualization web app built with React 19, Vite 7, TypeScript, and Tailwind CSS 4. It renders step-by-step animated traces of algorithms (currently sorting: merge sort, quick sort, heap sort) with synchronized code highlighting, narration, and playback controls. Deployed to GitHub Pages at `/visualise/`.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (ESLint 9 with typescript-eslint — covers `.js`/`.jsx`/`.ts`/`.tsx`)
- **Deploy:** `pnpm deploy` (runs build then gh-pages)
- **Package manager:** pnpm 10.30.0 (do not use npm/yarn)

There is no test runner configured.

## Architecture

### Trace System (core abstraction)

The entire visualization pipeline flows through **trace frames** (`src/types/trace-types.ts`):

1. An algorithm's `trace()` function takes `number[]` input and produces `TraceFrame[]`
2. Each `TraceFrame` contains a `TraceScene` (nodes, edges, overlays with positions) plus `TraceFocus` (which nodes/pointers to highlight)
3. Frames carry `codeToken` and `narrationToken` strings that link back to code highlighting and narration text
4. The player store (`usePlayerStore`) drives step-by-step playback through frames
5. Trace renderer layers (`src/components/trace/layers/`) paint nodes, edges, overlays, and pointers independently

### Algorithm Registry (auto-discovery)

Algorithms are auto-registered via `import.meta.glob("./**/*.def.{ts,tsx}")` in `src/generators/algorithms/registry.tsx`. To add a new algorithm, create a directory under `src/generators/algorithms/<category>/<algo-name>/` with:

- `<algo-name>.def.tsx` — default-exports an `AlgorithmDef` (label, category, trace fn, description, bullets, codeBundle, narrationBundle)
- `<algo-name>-trace.ts` — trace generator: `(input: number[]) => TraceFrame[]`
- `<algo-name>-layout.ts` — layout helpers for positioning nodes
- `<algo-name>.narration.ts` — maps narration tokens to text per `NarrationMode`
- `code/` directory with language-specific code strings and a `.bundle.ts` aggregator

The `.def.tsx` filename suffix is what triggers auto-registration — no manual imports needed.

### Code Highlighting with Marker Spans

Code sources use `[[token.name]]...[[/token.name]]` markers inline. `parseMarkerSpans()` in `src/generators/algorithms/sorting/markerSpans.ts` strips markers and produces `spansByToken` maps. When a trace frame's `codeToken` matches a token name, the corresponding code spans get highlighted in the Monaco editor.

### State Management

- **Zustand stores** (`src/stores/`) for client state: theme, code language, player state, auth, narration mode, layout, settings. Most persist to localStorage.
- **React Query** (`src/api/queries/`) for server state (catalog, memorise features).

### Theming

Three themes: `light`, `dark`, `tokyo-night`. Applied via `data-theme` attribute on `<html>` and CSS custom properties defined in `src/styles/tokens.css`. The `ThemeApplier` component syncs the store to the DOM.

### Routing

React Router DOM with hash routing. Main route is `/visualiser/:algorithm`. Algorithm ID in the URL maps directly to registry keys. Fallback redirects to `/visualiser/quick-sort`.

### API Layer

Axios instance in `src/api/http.ts` with bearer token injection and 401 refresh-token retry logic. Auth and memorise features exist but are currently disabled in routing.

### Vite Config

Production base path is `/visualise/` (for GitHub Pages). Dev base is `/`. SPA fallback handled by `public/404.html` redirect hack for GitHub Pages.
