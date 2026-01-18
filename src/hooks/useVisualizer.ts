// src/hooks/useVisualizer.ts
import { useEffect, useMemo } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { ALGORITHMS, type Algorithm } from "../algorithms/registry";
import type { AlgorithmStep, VisualState } from "../utils/types";

const GRID_HEIGHT = 18;
const GRID_WIDTH = 26;
const CELL_SIZE = 32;

export function useVisualizer(
  initialArray: number[],
  algorithm: Algorithm = "merge-sort" as Algorithm // change to your real default key if needed
) {
  /**
   * 1) Build steps whenever algorithm or input changes
   *    (registry-driven)
   */
  const steps = useMemo<AlgorithmStep<VisualState>[]>(() => {
    // If algorithm comes from route params, it can be invalid at runtime.
    // This keeps the app from exploding.
    const safeAlgorithm = (algorithm in ALGORITHMS
      ? algorithm
      : ("merge-sort" as Algorithm));

    return ALGORITHMS[safeAlgorithm].steps(initialArray);
  }, [initialArray, algorithm]);

  /**
   * 2) Playback state/actions
   */
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

  /**
   * 3) Keep store in sync with step count
   */
  useEffect(() => {
    setStepsLength(steps.length);
  }, [steps.length, setStepsLength]);

  /**
   * 3.5) Reset playback when algorithm changes
   */
  useEffect(() => {
    setPlaying(false);
    setPaused(false);
    setStep(0);
  }, [algorithm, setPlaying, setPaused, setStep]);

  /**
   * 4) Current step data
   */
  const { state, description, highlight } = useMemo(() => {
    const safe = Math.min(currentStep, steps.length - 1);
    return steps[safe] ?? steps[0];
  }, [steps, currentStep]);

  /**
   * 5) Previous highlight (trail)
   */
  const prevHighlight = useMemo(() => {
    const safe = Math.min(currentStep, steps.length - 1);
    if (safe <= 0) return [];
    return steps[safe - 1]?.highlight ?? [];
  }, [steps, currentStep]);

  /**
   * 6) Write-step detection
   */
  const isWriteStep = highlight.length > 0;
  const prevIsWriteStep = prevHighlight.length > 0;

  /**
   * 7) Auto-play timer
   */
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= steps.length - 1) {
      setPlaying(false);
      return;
    }

    const id = setTimeout(() => {
      nextStep();
    }, 1000 - speedMs);

    return () => clearTimeout(id);
  }, [isPlaying, currentStep, steps.length, nextStep, setPlaying, speedMs]);

  /**
   * 8) Layout
   */
  const rootLength = initialArray.length;
  const colOffset = Math.floor((GRID_WIDTH - rootLength) / 2);

  return {
    algorithm,
    steps,
    state,
    description,
    highlight,
    prevHighlight,
    isWriteStep,
    prevIsWriteStep,
    speedMs,
    layout: {
      gridHeight: GRID_HEIGHT,
      gridWidth: GRID_WIDTH,
      cellSize: CELL_SIZE,
      width: CELL_SIZE * GRID_WIDTH,
      height: CELL_SIZE * GRID_HEIGHT,
      colOffset,
    },
  };
}
