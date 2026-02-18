// src/components/trace/layers/TraceEdgeLayer.tsx
import React from "react";
import { TreeOverlay } from "../../visualizers/shared/TreeOverlay";
import type { TreeEdge } from "../../visualizers/shared/TreeOverlay";

export default function TraceEdgeLayer({ edges }: { edges: TreeEdge[] }) {
  return <TreeOverlay edges={edges} zIndex={0} />;
}
