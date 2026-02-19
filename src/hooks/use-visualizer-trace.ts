// src/hooks/use-visualizer-trace.ts
import { useEffect, useMemo } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { useCodeLangStore } from "../stores/useCodeLangStore";
import { useNarrationStore } from "../stores/useNarrationStore";
import { ALGORITHMS, type Algorithm } from "../generators/algorithms/registry";
import type { TraceFrame } from "../types/trace-types";
import type { CodeRef } from "../types/algo-types";
import type { NarrationCtx } from "../types/algo-types";



function parseIndexFromNodeId(nodeId: string): number | null {
  // supports "a:12" / "h:3" etc
  const m = /^([a-zA-Z]+):(\d+)$/.exec(nodeId);
  if (!m) return null;
  return Number(m[2]);
}

function buildNarrationCtxFromTrace(frame: TraceFrame): NarrationCtx {
  const ptr: Record<string, number> = {};

  for (const p of frame.focus?.pointers ?? []) {
    const idx = parseIndexFromNodeId(p.id);
    if (idx !== null) ptr[p.id] = idx;
  }

  return {
    ptr,
    meta: (frame.meta ?? {}) as Record<string, unknown>,
  };
}
export function useVisualizerTrace(
  initialArray: number[],
  algorithm: Algorithm
) {
  const lang = useCodeLangStore((s) => s.lang);
  const mode = useNarrationStore((s) => s.mode);

  const { def, frames } = useMemo(() => {
    const def = ALGORITHMS[algorithm];
    const traceFn = def?.trace;

    if (!traceFn) return { def, frames: [] as TraceFrame[] };

    return { def, frames: traceFn(initialArray) as TraceFrame[] };
  }, [initialArray, algorithm]);

  const traceEnabled = !!def?.trace;

  const {
    setStepsLength,
    currentStep,
    isPlaying,
    nextStep,
    setPlaying,
    setPaused,
    setStep,
    speedMs,
  } = usePlayerStore();

  useEffect(() => {
    if (!traceEnabled) return;
    setStepsLength(frames.length);
  }, [traceEnabled, frames.length, setStepsLength]);

  useEffect(() => {
    if (!traceEnabled) return;
    setPlaying(false);
    setPaused(false);
    setStep(0);
  }, [traceEnabled, algorithm, initialArray, setPlaying, setPaused, setStep]);

  const { frame, description, codeRef } = useMemo(() => {
    if (!traceEnabled) return { frame: null as any, description: "", codeRef: undefined as CodeRef | undefined };
    const safe = Math.min(currentStep, Math.max(frames.length - 1, 0));
    const frame = frames[safe] ?? frames[0];

    const codeToken = frame?.codeToken;
    const narrationToken = frame?.narrationToken;

    const codeRef: CodeRef | undefined =
      codeToken ? def.codeBundle.resolve(lang, codeToken) : undefined;

    let description = "";
    if (narrationToken && def.narrationBundle) {
      description = def.narrationBundle.resolve(
        narrationToken,
        mode,
        buildNarrationCtxFromTrace(frame)
      );
    }

    return { frame, description, codeRef };
  }, [traceEnabled, frames, currentStep, def, lang, mode]);

  useEffect(() => {
    if (!traceEnabled) return;
    if (!isPlaying) return;

    if (currentStep >= frames.length - 1) {
      setPlaying(false);
      return;
    }

    const id = setTimeout(() => nextStep(), 1000 - speedMs);
    return () => clearTimeout(id);
  }, [traceEnabled, isPlaying, currentStep, frames.length, nextStep, setPlaying, speedMs]);

  return {
    traceEnabled,
    frames,
    frame,
    scene: frame?.scene,
    focus: frame?.focus,
    description,
    codeRef,
    rootLength: initialArray.length,
    speedMs,
  };
}
