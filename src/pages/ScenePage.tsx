// src/pages/ScenePage.tsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";

import Visualizer from "../components/visualizers/Visualizer";
import AlgoWorkspaceShell from "../components/layout/AlgoWorkSpaceShell";
import AlgoInfoPanel from "../components/code/AlgoInfoPanel";

import { Panel } from "../components/ui/Panel";
import { SCENES } from "../generators/scenes/registry";
import { useVisualizerTraceFromFrames } from "../hooks/use-visualizer-trace-from-frames";

const DEFAULT_SCENE_ID = "file-upload-cdn";

export default function ScenePage() {
    const { sceneId } = useParams<{ sceneId: string }>();

    const def = sceneId ? SCENES[sceneId] : undefined;

    const frames = React.useMemo(() => def?.trace() ?? [], [def]);

    const trace = useVisualizerTraceFromFrames(frames);

    if (!sceneId || !def) {
        return <Navigate to="/scenes/file-upload-cdn" replace />;
    }

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
            <Panel tone="soft" radius="xl" className="p-4 text-sm text-tn-muted">
                Scene controls panel (coming next).
            </Panel>
        </div>
    );

    return <AlgoWorkspaceShell left={leftNode} right={rightNode} />;
}
