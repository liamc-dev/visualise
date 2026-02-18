// src/pages/VisualiserPage.tsx
import React, { Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";

import VisualizerZ from "../components/visualizers/Visualizer";

import AlgoInfoPanel from "../components/code/AlgoInfoPanel";
import AlgoCodePanel from "../components/code/AlgoCodePanel";
import AlgoWorkspaceShell from "../components/layout/AlgoWorkSpaceShell";

import { ALGORITHMS, type AlgorithmId, toAlgorithmId } from "../generators/algorithms/registry";
import { useVisualizerTrace } from "../hooks/use-visualizer-trace";

import { useBrand } from "../brand/useBrand";

const AlgoCodePanelDesktop = React.lazy(
  () => import("../components/code/AlgoCodePanelDesktop")
);

export default function VisualiserPage() {
  const INITIAL_ARRAY = [12, 5, 19, 3, 14, 8, 17, 1, 10, 6, 15, 2, 18, 7, 13];

  const { algorithm } = useParams<{ algorithm: string }>();
  if (!algorithm || !(algorithm in ALGORITHMS)) {
    return <Navigate to="/visualiser/merge-sort" replace />;
  }

  const algoKey: AlgorithmId =
    toAlgorithmId(algorithm ?? "") ?? ("merge-sort" as AlgorithmId);

  const def = ALGORITHMS[algoKey];
  const { getAlgoLogoSrc } = useBrand();
  const logoSrc = getAlgoLogoSrc(algoKey);

  const trace = useVisualizerTrace(INITIAL_ARRAY, algoKey);

  const visualNode =
    def.trace && trace.traceEnabled && trace.scene ? (
      <VisualizerZ
        id={algoKey}
        scene={trace.scene}
        focus={trace.focus}
        description={trace.description}
        speedMs={trace.speedMs}
        domainSize={trace.rootLength}
      />
    ) : (
      <div className="w-full min-h-[360px] rounded-xl border border-tn-border bg-tn-surface flex items-center justify-center text-tn-subtle">
        Trace not available for{" "}
        <span className="ml-1 font-semibold text-tn-text">{def.label}</span>.
      </div>
    );

  
  const codeBundle = def.codeBundle;
  const codeRef = trace.codeRef;

  const leftNode = (
    <div className="min-w-0 flex flex-col gap-2">
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
