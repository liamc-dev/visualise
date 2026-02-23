// src/pages/VisualiserPage.tsx
import React, { Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";

import VisualizerZ from "../components/visualizers/Visualizer";

import AlgoInfoPanel from "../components/code/AlgoInfoPanel";
import AlgoCodePanel from "../components/code/AlgoCodePanel";
import AlgoWorkspaceShell from "../components/layout/AlgoWorkSpaceShell";

import { ALGORITHMS, type AlgorithmId, toAlgorithmId } from "../generators/algorithms/registry";
import { useVisualizerTrace } from "../hooks/use-visualizer-trace";
import { useLastAlgorithm, getLastAlgorithm } from "../hooks/use-last-algorithm";

import { useBrand } from "../brand/useBrand";
import { useArrayInputStore } from "../stores/useArrayInputStore";
import { useGraphInputStore } from "../stores/useGraphInputStore";
import { useGridInputStore } from "../stores/useGridInputStore";
import { useDijkstraGridStore } from "../stores/useDijkstraGridStore";
import { useAstarGridStore } from "../stores/useAstarGridStore";
import { useLayoutStore } from "../stores/useLayoutStore";
import ArrayInputBar from "../components/control/ArrayInputBar";
import GraphInputBar from "../components/control/GraphInputBar";
import GridInputBar from "../components/control/GridInputBar";
import DijkstraInputBar from "../components/control/DijkstraInputBar";
import AstarInputBar from "../components/control/AstarInputBar";
import { Panel } from "../components/ui/Panel";
import { IconBtn } from "../components/ui/IconBtn";
import { SlidersHorizontal } from "lucide-react";
import { DEFAULT_DIJKSTRA_INPUT } from "../lib/graph-utils";

const AlgoCodePanelDesktop = React.lazy(
  () => import("../components/code/AlgoCodePanelDesktop")
);

export default function VisualiserPage() {
  const { algorithm } = useParams<{ algorithm: string }>();

  const algoKey: AlgorithmId =
    toAlgorithmId(algorithm ?? "") ?? ("merge-sort" as AlgorithmId);

  useLastAlgorithm(algoKey);
  const def = ALGORITHMS[algoKey];
  const { getAlgoLogoSrc } = useBrand();
  const logoSrc = getAlgoLogoSrc(algoKey);

  const isSorting = def.category === "Sorting";
  const isGridPathfinding = algoKey === "bfs" || algoKey === "dfs";
  const isDijkstra = algoKey === "dijkstra";
  const isAstar = algoKey === "a-star";
  const isOtherGraphPathfinding = def.category === "Pathfinding" && !isGridPathfinding && !isDijkstra && !isAstar;

  const dijkstraMode = useLayoutStore((s) => s.dijkstraMode);

  const arrayInput = useArrayInputStore((s) => s.array);
  const graphInput = useGraphInputStore((s) => s.array);
  const gridInput = useGridInputStore((s) => s.array);
  const dijkstraGridInput = useDijkstraGridStore((s) => s.array);
  const astarGridInput = useAstarGridStore((s) => s.array);
  const inputArray = isGridPathfinding
    ? gridInput
    : isDijkstra
      ? (dijkstraMode === "graph" ? graphInput : dijkstraGridInput)
      : isAstar
        ? astarGridInput
        : isOtherGraphPathfinding
          ? graphInput
          : arrayInput;

  const trace = useVisualizerTrace(inputArray, algoKey);

  const arrayInputCollapsed = useLayoutStore((s) => s.arrayInputCollapsed);
  const toggleArrayInput = useLayoutStore((s) => s.toggleArrayInput);
  const graphInputCollapsed = useLayoutStore((s) => s.graphInputCollapsed);
  const toggleGraphInput = useLayoutStore((s) => s.toggleGraphInput);
  const gridInputCollapsed = useLayoutStore((s) => s.gridInputCollapsed);
  const toggleGridInput = useLayoutStore((s) => s.toggleGridInput);
  const dijkstraInputCollapsed = useLayoutStore((s) => s.dijkstraInputCollapsed);
  const toggleDijkstraInput = useLayoutStore((s) => s.toggleDijkstraInput);
  const astarInputCollapsed = useLayoutStore((s) => s.astarInputCollapsed);
  const toggleAstarInput = useLayoutStore((s) => s.toggleAstarInput);

  if (!algorithm || !(algorithm in ALGORITHMS)) {
    return <Navigate to={`/visualiser/${getLastAlgorithm()}`} replace />;
  }

  const visualNode =
    def.trace && trace.traceEnabled && trace.scene ? (
      <VisualizerZ
        scene={trace.scene}
        focus={trace.focus}
        description={trace.description}
        speedMs={trace.speedMs}
        domainSize={trace.rootLength}
        contentHeightRows={trace.contentHeightRows}
      />
    ) : (
      <Panel tone="solid" radius="xl" className="w-full min-h-[360px] flex items-center justify-center text-tn-subtle">
        Trace not available for{" "}
        <span className="ml-1 font-[var(--st-fw-semibold)] text-tn-text">{def.label}</span>.
      </Panel>
    );


  const codeBundle = def.codeBundle;
  const codeRef = trace.codeRef;

  const leftNode = (
    <div className="min-w-0 flex flex-col gap-2">
      {isSorting && (
        arrayInputCollapsed ? (
          <div className="flex justify-end px-1">
            <IconBtn
              onClick={toggleArrayInput}
              title="Show input array"
              className="w-7 h-7"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-tn-muted" />
            </IconBtn>
          </div>
        ) : (
          <ArrayInputBar />
        )
      )}

      {isDijkstra && (
        dijkstraInputCollapsed ? (
          <div className="flex justify-end px-1">
            <IconBtn
              onClick={toggleDijkstraInput}
              title="Show Dijkstra input"
              className="w-7 h-7"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-tn-muted" />
            </IconBtn>
          </div>
        ) : (
          <DijkstraInputBar />
        )
      )}

      {isAstar && (
        astarInputCollapsed ? (
          <div className="flex justify-end px-1">
            <IconBtn
              onClick={toggleAstarInput}
              title="Show A* input"
              className="w-7 h-7"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-tn-muted" />
            </IconBtn>
          </div>
        ) : (
          <AstarInputBar />
        )
      )}

      {isOtherGraphPathfinding && (
        graphInputCollapsed ? (
          <div className="flex justify-end px-1">
            <IconBtn
              onClick={toggleGraphInput}
              title="Show graph input"
              className="w-7 h-7"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-tn-muted" />
            </IconBtn>
          </div>
        ) : (
          <GraphInputBar weighted={true} defaults={DEFAULT_DIJKSTRA_INPUT} />
        )
      )}

      {isGridPathfinding && (
        gridInputCollapsed ? (
          <div className="flex justify-end px-1">
            <IconBtn
              onClick={toggleGridInput}
              title="Show grid input"
              className="w-7 h-7"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-tn-muted" />
            </IconBtn>
          </div>
        ) : (
          <GridInputBar />
        )
      )}

      {visualNode}

      <AlgoInfoPanel
        logoSrc={logoSrc ?? ""}
        logoAlt={`${def.label} Artwork`}
        title={def.label}
        description={
          def.description ?? (
            <>
              No description yet for <strong>{def.label}</strong>.
            </>
          )
        }
        bullets={def.bullets}
      />
    </div>
  );

  const rightNode = (
    <div className="min-w-0 w-full flex flex-col min-h-0 h-full">
      <div className="xl:hidden">
        <AlgoCodePanel codeBundle={codeBundle} codeRef={codeRef} />
      </div>

      <div className="hidden xl:flex flex-col flex-1 min-h-0">
        <Suspense fallback={<AlgoCodePanel codeBundle={codeBundle} codeRef={codeRef} />}>
          <AlgoCodePanelDesktop
            algorithmId={algoKey}
            codeBundle={codeBundle}
            codeRef={codeRef}
            headerLabel="Code"
          />
        </Suspense>
      </div>
    </div>
  );

  return <AlgoWorkspaceShell left={leftNode} right={rightNode} />;
}
