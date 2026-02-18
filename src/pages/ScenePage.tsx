// src/pages/ScenePage.tsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";

import Visualizer from "../components/visualizers/Visualizer";
import AlgoWorkspaceShell from "../components/layout/AlgoWorkSpaceShell";
import AlgoInfoPanel from "../components/code/AlgoInfoPanel";

import { SCENES } from "../generators/scenes/registry";
import { useVisualizerTraceFromFrames } from "../hooks/use-visualizer-trace-from-frames";

const DEFAULT_SCENE_ID = "file-upload-cdn";

export default function ScenePage() {
    const { sceneId } = useParams<{ sceneId: string }>();

    if (!sceneId) {
        return <Navigate to="/scenes/file-upload-cdn" replace />;
    }

    const def = SCENES[sceneId];
    if (!def) {
        return <Navigate to="/scenes/file-upload-cdn" replace />;
    }


    const frames = React.useMemo(() => def.trace(), [def.id]);

    const trace = useVisualizerTraceFromFrames(frames);

    const leftNode = (
        <div className="min-w-0 flex flex-col gap-2">
            {trace.scene ? (
                <Visualizer
                    id={def.id}
                    scene={trace.scene}
                    focus={trace.focus}
                    description={trace.description}
                    speedMs={trace.speedMs}
                    domainSize={1}
                    contentWidthCols={trace.contentWidthCols}
                />
            ) : null}

            <AlgoInfoPanel
                logoSrc={""}
                logoAlt={`${def.label} Artwork`}
                title={def.label}
                description={def.description}
                bullets={def.bullets}
            />
        </div>
    );

    const rightNode = (
        <div className="min-w-0 w-full flex flex-col min-h-0 h-full">
            <div className="rounded-xl border border-tn-border bg-tn-surfaceSoft/55 p-4 text-sm text-tn-muted">
                Scene controls panel (coming next).
            </div>
        </div>
    );

    return <AlgoWorkspaceShell left={leftNode} right={rightNode} />;
}
