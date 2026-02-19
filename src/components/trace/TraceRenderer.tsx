// src/components/trace/TraceRenderer.tsx
import React, { useMemo } from "react";
import { useSettingsStore } from "../../stores/useSettingsStore";
import type { TraceScene, TraceFocus } from "../../types/trace-types";
import { TraceOverlayLayer } from "./layers/TraceOverlayLayer";

import { useTraceEdges } from "./hooks/use-trace-edges";
import TraceEdgeLayer from "./layers/TraceEdgeLayer";
import TraceNodeLayer from "./layers/TraceNodeLayer";
import TracePointerLayer from "./layers/TracePointerLayer";

export default function TraceRenderer({
  scene,
  focus,
  cellSize,
  colOffset,
}: {
  scene: TraceScene;
  focus?: TraceFocus;
  cellSize: number;
  colOffset: number;
}) {
  const effects = useSettingsStore((s) => s.effectsEnabled);

  const focusNodes = useMemo(() => new Set(focus?.nodes ?? []), [focus?.nodes]);
  const focusEdges = useMemo(() => new Set(focus?.edges ?? []), [focus?.edges]);
  
  const nodePx = useMemo(() => {
    const nodeMap = new Map<string, { x: number; y: number }>();
    for (const n of scene.nodes) {
      const x = (colOffset + n.pos.x) * cellSize;
      const y = n.pos.y * cellSize;
      nodeMap.set(n.id, { x, y });
    }
    return nodeMap;
  }, [scene.nodes, colOffset, cellSize]);

  const edges = useTraceEdges({
    scene,
    cellSize,
    colOffset,
    focusNodes,
    focusEdges,
  });

  return (
    <>
      <TraceEdgeLayer edges={edges} />

      <TraceOverlayLayer
        overlays={scene.overlays ?? []}
        cellSize={cellSize}
        colOffset={colOffset}
        zIndex={1}
      />

      <TraceNodeLayer
        nodes={scene.nodes}
        nodePx={nodePx}
        focusNodes={focusNodes}
        cellSize={cellSize}
        colOffset={colOffset}
        effects={effects}
      />

      <TracePointerLayer
        pointers={focus?.pointers ?? []}
        nodePx={nodePx}
        cellSize={cellSize}
        colOffset={colOffset}
      />
    </>
  );
}
