import { useRef, useEffect, useCallback } from "react";

type HoldHandlers = {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
};

export function useHoldRepeat(
  action: () => void,
  {
    delay = 400,        // ⬅ how long to hold before repeating (ms)
    interval = 90,      // ⬅ repeat speed after delay
    enabled = true,
  }: { delay?: number; interval?: number; enabled?: boolean } = {}
): HoldHandlers {
  const delayTimer = useRef<number | null>(null);
  const repeatTimer = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    if (delayTimer.current !== null) {
      window.clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    if (repeatTimer.current !== null) {
      window.clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!enabled) return;

    // Immediate click → one action
    action();

    // Start long-press delay timer
    delayTimer.current = window.setTimeout(() => {
      // Start repeated firing after delay
      repeatTimer.current = window.setInterval(() => {
        action();
      }, interval);
    }, delay);
  }, [action, delay, interval, enabled]);

  useEffect(() => clearAll, [clearAll]);

  return {
    onMouseDown: start,
    onMouseUp: clearAll,
    onMouseLeave: clearAll,
    onTouchStart: start,
    onTouchEnd: clearAll,
  };
}
