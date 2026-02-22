// src/hooks/use-controls-visibility.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";

const HIDE_DELAY = 2500;

/** YouTube-style: controls hidden by default, visible on hover, auto-hide during playback. */
export function useControlsVisibility() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const paused = usePlayerStore((s) => s.paused);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hoveringRef = useRef(false);

  const startHideTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  }, []);

  // On playback state change, flash controls briefly then auto-hide
  useEffect(() => {
    if (isPlaying || paused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return {
    visible,
    containerHandlers: { onMouseEnter, onMouseMove, onMouseLeave },
  };
}
