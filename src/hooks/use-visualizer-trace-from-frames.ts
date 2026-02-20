// src/hooks/use-visualizer-trace-from-frames.ts
import { useEffect, useMemo } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { usePlaybackLoop } from "./use-playback-loop";
import type { TraceFrame } from "../types/trace-types";

/**
 * Scene playback hook that reuses the global player store (same as useVisualizerTrace),
 * but takes frames directly and stays algorithm-agnostic.
 */
export function useVisualizerTraceFromFrames(frames: TraceFrame[]) {
  const {
    setStepsLength,
    currentStep,
    setPlaying,
    setPaused,
    setStep,
    speedMs,
  } = usePlayerStore();

  const traceEnabled = frames.length > 0;

  // Keep player length in sync
  useEffect(() => {
    if (!traceEnabled) return;
    setStepsLength(frames.length);
  }, [traceEnabled, frames.length, setStepsLength]);

  // Reset when a new frame set comes in (scene changed)
  useEffect(() => {
    if (!traceEnabled) return;
    setPlaying(false);
    setPaused(false);
    setStep(0);
  }, [traceEnabled, frames, setPlaying, setPaused, setStep]);

  const { frame, description, codeRef } = useMemo(() => {
    if (!traceEnabled) {
      return { frame: null as any, description: "", codeRef: undefined as any };
    }

    const safe = Math.min(currentStep, Math.max(frames.length - 1, 0));
    const frame = frames[safe] ?? frames[0];

    // Scenes don't currently have narration/code bundles.
    // We'll still surface tokens as a default "description".
    const description = frame?.narrationToken ?? frame?.kind ?? "";

    // Scenes don't resolve codeRef yet.
    const codeRef = undefined;

    return { frame, description, codeRef };
  }, [traceEnabled, frames, currentStep]);

  // Compute content width from the FIRST frame so the centering is stable
  const contentWidthCols = useMemo(() => {
    const s0 = frames[0]?.scene;
    const nodes = s0?.nodes ?? [];
    if (!nodes.length) return 10;

    let minX = Infinity;
    let maxX = -Infinity;

    for (const n of nodes) {
      const x = n.pos?.x;
      if (typeof x !== "number") continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return 10;

    // +1 because positions are grid coordinates
    return Math.max(1, Math.ceil(maxX - minX + 1));
  }, [frames]);

  usePlaybackLoop({ enabled: traceEnabled, frameCount: frames.length });

  return {
    traceEnabled,
    frames,
    frame,
    scene: frame?.scene,
    focus: frame?.focus,
    description,
    codeRef,
    rootLength: contentWidthCols,
    contentWidthCols,
    speedMs,
  };
}
