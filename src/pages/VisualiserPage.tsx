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
import { useLayoutStore } from "../stores/useLayoutStore";
import ArrayInputBar from "../components/control/ArrayInputBar";
import { Panel } from "../components/ui/Panel";
import { IconBtn } from "../components/ui/IconBtn";
import { SlidersHorizontal } from "lucide-react";

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

  const inputArray = useArrayInputStore((s) => s.array);
  const trace = useVisualizerTrace(inputArray, algoKey);
  const arrayInputCollapsed = useLayoutStore((s) => s.arrayInputCollapsed);
  const toggleArrayInput = useLayoutStore((s) => s.toggleArrayInput);

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
      {arrayInputCollapsed ? (
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
