// src/components/trace/layers/TraceEdgeLayer.tsx
import React from "react";
import { TreeOverlay } from "../shared/TreeOverlay";
import type { TreeEdge } from "../shared/TreeOverlay";

export default function TraceEdgeLayer({ edges }: { edges: TreeEdge[] }) {
  return <TreeOverlay edges={edges} zIndex={0} />;
}
