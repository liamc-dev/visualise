// src/pages/memorise/MemoriseSessionPage.tsx
import React, { Suspense, useMemo, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";

import Visualizer from "../../components/visualizers/Visualizer";

import AlgoInfoPanel from "../../components/code/AlgoInfoPanel";
import AlgoCodePanel from "../../components/code/AlgoCodePanel";
import { Btn } from "../../components/ui/Btn";
import { ALGORITHMS, type AlgorithmId, toAlgorithmId } from "../../generators/algorithms/registry";
import { useVisualizerTrace } from "../../hooks/use-visualizer-trace";
import { useBrand } from "../../brand/useBrand";
import { Panel } from "../../components/ui/Panel";
import AlgoWorkspaceShell from "../../components/layout/AlgoWorkSpaceShell";

const AlgoCodePanelDesktop = React.lazy(
    () => import("../../components/code/AlgoCodePanelDesktop")
);

type MemorisePhase = "recall" | "hint" | "compare" | "repair" | "schedule";

export default function MemoriseSessionPage() {
    const navigate = useNavigate();

    const INITIAL_ARRAY = useMemo(() => [14, 4, 8, 10, 14, 20, 16, 18, 6, 11], []);

    const { algorithm } = useParams<{ algorithm: string }>();
    if (!algorithm || !(algorithm in ALGORITHMS)) {
        return <Navigate to="/memorise" replace />;
    }

    const algoKey: AlgorithmId =
        toAlgorithmId(algorithm ?? "") ?? ("merge-sort" as AlgorithmId);

    const def = ALGORITHMS[algoKey];
    const { getAlgoLogoSrc } = useBrand();
    const logoSrc = getAlgoLogoSrc(algoKey);

    const trace = useVisualizerTrace(INITIAL_ARRAY, algoKey);

    const [phase, setPhase] = useState<MemorisePhase>("recall");
    const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);

    const compareUnlocked = hasSubmittedAttempt && phase !== "recall";

    const leftNode = (
        <div className="min-w-0 flex flex-col gap-2">
            <div className="relative">
                {def.trace && trace.traceEnabled && trace.scene ? (
                    <Visualizer
                        id={algoKey}
                        scene={trace.scene}
                        focus={trace.focus}
                        description={trace.description}
                        speedMs={trace.speedMs}
                        domainSize={trace.rootLength}
                    />
                ) : (
                    <Panel tone="solid" className="w-full min-h-[360px] flex items-center justify-center text-tn-subtle">
                        Trace not available for{" "}
                        <span className="ml-1 font-[var(--st-fw-semibold)] text-tn-text">{def.label}</span>.
                    </Panel>
                )}

                {/* Visualiser lock overlay */}
                {!hasSubmittedAttempt && (
                    <div
                        className="
              absolute inset-0 rounded-st-md
              bg-tn-surface/70 backdrop-blur-[2px]
              border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border
              flex items-center justify-center
              pointer-events-auto shadow-st-card
            "
                    >
                        <div className="max-w-[46ch] text-center px-4">
                            <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
                                Memorise
                            </div>
                            <div className="mt-2 text-sm font-[var(--st-fw-medium)]">locked</div>
                            <div className="mt-1 text-xs text-tn-muted">
                                Submit your first recall attempt to unlock.
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

    const codeBundle = def.codeBundle;
    const codeRef = trace.codeRef;

    const rightNode = (
        <div className="min-w-0 w-full flex flex-col min-h-0 h-full">
            {/* Minimal “phase bar” */}
            <div
                className="
          mb-2 rounded-st-sm border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border
          bg-tn-surfaceSoft/55 px-3 py-2
          flex items-center justify-between gap-3
        "
            >
                <div className="min-w-0">
                    <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
                        Memorise Session
                    </div>
                    <div className="text-sm font-[var(--st-fw-medium)] truncate">
                        {def.label} · {phase === "recall" ? "Recall" : phase}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Btn
                        className="bg-tn-surfaceSoft/60  text-xs hover:bg-tn-surfaceSoft/70"
                        onClick={() => navigate("/memorise")}
                    >
                        Exit
                    </Btn>

                    <Btn
                        className="bg-tn-surfaceSoft/60  text-xs hover:bg-tn-surfaceSoft/70"
                        onClick={() => {
                            setHasSubmittedAttempt(true);
                            setPhase("hint");
                        }}
                    >
                        Submit attempt
                    </Btn>
                </div>
            </div>

            {/* Code panels (trace-only) */}
            <div className="xl:hidden">
                <AlgoCodePanel codeBundle={codeBundle} codeRef={codeRef} />
            </div>

            <div className="hidden xl:flex flex-col flex-1 min-h-0">
                <Suspense fallback={<AlgoCodePanel codeBundle={codeBundle} codeRef={codeRef} />}>
                    <AlgoCodePanelDesktop
                        algorithmId={algoKey}
                        codeBundle={codeBundle}
                        codeRef={codeRef}
                        initialView="recall"
                        compareEnabled={compareUnlocked}
                        showBackToReference={false}
                        showRevealReference={true}
                        headerLabel="Memorise · Code"
                    />
                </Suspense>
            </div>
        </div>
    );

    return <AlgoWorkspaceShell left={leftNode} right={rightNode} />;
}
