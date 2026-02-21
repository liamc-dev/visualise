// src/hooks/use-controls-visibility.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";

const HIDE_DELAY = 2500;

/** Controls auto-hide when playing OR paused; always visible when stopped. */
export function useControlsVisibility() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const paused = usePlayerStore((s) => s.paused);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hoveringRef = useRef(false);

  const startHideTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  }, []);

  const isActive = useCallback(() => {
    const s = usePlayerStore.getState();
    return s.isPlaying || s.paused;
  }, []);

  useEffect(() => {
    if (!isPlaying && !paused) {
      // Stopped — always visible
      setVisible(true);
      clearTimeout(timerRef.current);
    } else {
      // Playing or paused — show briefly then auto-hide
      setVisible(true);
      startHideTimer();
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, paused, startHideTimer]);

  const onMouseEnter = useCallback(() => {
    hoveringRef.current = true;
    clearTimeout(timerRef.current);
    setVisible(true);
  }, []);

  const onMouseMove = useCallback(() => {
    if (!hoveringRef.current) return;
    clearTimeout(timerRef.current);
    setVisible(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    hoveringRef.current = false;
    if (isActive()) {
      clearTimeout(timerRef.current);
      setVisible(false);
    }
  }, [isActive]);

  return {
    visible,
    containerHandlers: { onMouseEnter, onMouseMove, onMouseLeave },
  };
}
