```
        _                  _ _
 __   _(_)___ _   _  __ _ | (_)___  ___
 \ \ / / / __| | | |/ _` || | / __|/ _ \
  \ V /| \__ \ |_| | (_| || | \__ \  __/
   \_/ |_|___/\__,_|\__,_||_|_|___/\___|
```

**Step through algorithms, frame by frame.** A visual debugger for sorting and pathfinding algorithms with synchronized code highlighting, narration, and playback controls.

[**Live Demo**](https://liamc-dev.github.io/visualise/)

<!-- screenshot -->

## Features

- **Frame-by-frame playback** — step forward, back, or autoplay with speed control
- **Synchronized code highlighting** — see exactly which line executes on each step
- **Narration** — plain-English explanations of what's happening and why
- **Predict mode** — guess the next state before revealing it
- **4 themes** — light, dark, tokyo night, ember
- **Editable inputs** — tweak arrays, grids, and graph weights on the fly

## Algorithms

| Sorting | Search | Pathfinding |
|---------|--------|-------------|
| Bubble Sort | Linear Search | BFS (grid) |
| Insertion Sort | Binary Search | DFS (grid) |
| Selection Sort | | Dijkstra (graph + grid) |
| Merge Sort | | Bellman-Ford (graph) |
| Quick Sort | | A* Search (grid) |
| Heap Sort | | |
| Radix Sort | | |
| Counting Sort | | |

## Themes

- **Light** — clean and minimal
- **Dark** — plum-tinted panels, easy on the eyes
- **Tokyo Night** — moody blues and purples, neon accents
- **Ember** — warm, cozy tones

## Getting Started

```bash
pnpm install
pnpm dev          # dev server on localhost:5173
pnpm build        # production build
pnpm lint         # eslint (zero warnings policy)
pnpm run deploy   # build + deploy to GitHub Pages
```

Requires **pnpm** and **Node 18+**.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server + bundler
- **Tailwind CSS 4** — utility-first styling
- **Zustand** — state management
- **Monaco Editor** — code panel with syntax highlighting
- **Framer Motion** — animations
- **React Router** — hash-based routing
- **React Query** — server state

## License

MIT
