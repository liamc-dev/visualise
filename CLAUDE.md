# Visualise

> Architecture constraints for Claude Code. Import details with @path.

## Build commands
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm run deploy` — build + deploy to GitHub Pages
- Package manager: pnpm. Do not use npm or yarn.
- No test runner configured.

## Architecture

### Trace system (core abstraction)
1. Algorithm `trace()` function takes input → produces `TraceFrame[]`
2. Each frame contains `TraceScene` (nodes, edges, overlays) + `TraceFocus` (highlights)
3. Frames carry `codeToken` and `narrationToken` linking to code highlighting and narration
4. `usePlayerStore` drives step-by-step playback through frames
5. Trace renderer layers (`src/components/trace/layers/`) paint nodes, edges, overlays, pointers independently

### Algorithm registry (auto-discovery)
Algorithms auto-register via `import.meta.glob("./**/*.def.{ts,tsx}")` in `src/generators/algorithms/registry.ts`. To add an algorithm, create a directory under `src/generators/algorithms/<category>/<algo-name>/` with:
- `<algo-name>.def.tsx` — default-exports `AlgorithmDef`
- `<algo-name>-trace.ts` — trace generator
- `<algo-name>-layout.ts` — layout helpers
- `<algo-name>.narration.ts` — narration token map
- `code/` directory with language-specific code strings + `.bundle.ts`

The `.def.tsx` suffix triggers auto-registration. No manual imports.

### Key conventions
- **UI primitives** in `src/components/ui/` — Panel, Btn, IconBtn, TextInput, TextArea, PortalSelect, IconSelect, SegmentedControl. Use these, never raw HTML elements.
- **Code highlighting** uses `[[token.name]]...[[/token.name]]` markers. See `src/generators/algorithms/markerSpans.ts`.
- **State:** Zustand stores in `src/stores/`. React Query for server state in `src/api/queries/`.
- **Theming:** 4 color themes (`light`, `dark`, `tokyo-night`, `ember`) via `data-theme` + CSS custom properties in `src/styles/tokens.css`. 4 style presets (`default`, `terminal`, `clean`, `organic`) via `data-style`.
- **Routing:** React Router DOM with hash routing. `/visualiser/:algorithm` maps to registry keys.

## Anti-patterns — do not
- Never manually register algorithms — use the `.def.tsx` convention
- Never put layout logic in trace functions — separate into `*-layout.ts`
- Never bypass the trace frame abstraction to render directly
- Never create raw HTML elements when a UI primitive exists
- Never add dependencies without checking if existing ones cover the need
- Never create files over 300 lines — split by concern
- Never hardcode font sizes (e.g. `text-[10px]`) — use project tokens (`text-micro`, `text-label`, `text-button`, `text-ui`, `text-body`, `text-title`) defined in `tokens.css`
- Each code marker token should highlight at most 3 lines (prefer 1–2)
- Helper functions in code bundles are not wrapped in markers — only mark the call site

## Known issues
- Auth and memorise features exist in code but are disabled in routing
- API layer (`src/api/http.ts`) has bearer token + 401 refresh logic for a backend that isn't active
- `public/404.html` redirect hack for GitHub Pages SPA routing — fragile, don't touch unless broken

## Vite config
- Production base path: `/visualise/` (GitHub Pages)
- Dev base: `/`
