// src/hooks/useGridSweepPhase.ts
import { useEffect, useRef, useState } from "react";

/**
 * @param value Raw knob value (e.g. 100–1000 from SpeedKnob)
 * @param min   Minimum knob value (default 100)
 * @param max   Maximum knob value (default 1000)
 */
export function useGridSweepPhase(value: number, min = 100, max = 1000) {
  const [phase, setPhase] = useState(0); // 0..1

  const periodRef = useRef(8000);       // current period in ms
  const phaseRef = useRef(0);           // internal accumulator 0..1
  const lastTimeRef = useRef<number | null>(null);

  // --- 1. Map knob value -> normalized -> periodMs ---

  // clamp + normalize 0..1
  const norm = Math.min(1, Math.max(0, (value - min) / (max - min)));

  // invert so right = faster
  const inv = 1 - norm;

  // map 0..1 -> [slow..fast] (tweak these to taste)
  const SLOW_MS = 18000; // slowest sweep
  const FAST_MS = 2500;  // fastest sweep

  const periodMs = FAST_MS + inv * (SLOW_MS - FAST_MS);

  // keep latest period in a ref (no restart)
  useEffect(() => {
    periodRef.current = periodMs;
  }, [periodMs]);

  // --- 2. RAF loop: increment phase smoothly using dt/period ---

  useEffect(() => {
    let frame: number;

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const dt = timestamp - lastTimeRef.current; // ms since last frame
      lastTimeRef.current = timestamp;

      const period = periodRef.current || 1;
      const deltaPhase = dt / period; // how much of the cycle passed this frame

      phaseRef.current = (phaseRef.current + deltaPhase) % 1;
      setPhase(phaseRef.current);

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return phase; // 0..1, continuous even when speed changes
}
