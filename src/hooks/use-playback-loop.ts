import { useEffect } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { usePredictStore } from "../stores/usePredictStore";

type PlaybackLoopOpts = {
  enabled: boolean;
  frameCount: number;
};

/**
 * Shared auto-play timer used by both useVisualizerTrace and
 * useVisualizerTraceFromFrames. Handles predict-mode pausing so
 * every visualization type gets predict for free.
 */
export function usePlaybackLoop({ enabled, frameCount }: PlaybackLoopOpts) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentStep = usePlayerStore((s) => s.currentStep);
  const nextStep = usePlayerStore((s) => s.nextStep);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const speedMs = usePlayerStore((s) => s.speedMs);
  const awaitingReveal = usePlayerStore((s) => s.awaitingReveal);
  const setAwaitingReveal = usePlayerStore((s) => s.setAwaitingReveal);

  const predictEnabled = usePredictStore((s) => s.predictEnabled);

  // Main playback tick
  useEffect(() => {
    if (!enabled) return;
    if (!isPlaying) return;
    if (awaitingReveal) return;

    if (currentStep >= frameCount - 1) {
      setPlaying(false);
      return;
    }

    const id = setTimeout(() => {
      nextStep();
      if (predictEnabled) setAwaitingReveal(true);
    }, 1000 - speedMs);

    return () => clearTimeout(id);
  }, [enabled, isPlaying, awaitingReveal, currentStep, frameCount, nextStep, setPlaying, speedMs, predictEnabled, setAwaitingReveal]);

  // Clear awaitingReveal when predict mode is toggled off
  useEffect(() => {
    if (!predictEnabled) {
      setAwaitingReveal(false);
    }
  }, [predictEnabled, setAwaitingReveal]);
}
