// src/components/player/PlayerBar.tsx
import type { ReactNode } from "react";
import Transport from "./Transport";
import { SpeedSlider } from "./SpeedSlider";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { usePredictStore } from "../../stores/usePredictStore";
import NarrationModeSwitch from "../control/NarrationModeSwitch";
import { useNarrationStore } from "../../stores/useNarrationStore";

type Props = { description?: ReactNode };

export default function PlayerBar({ description }: Props) {
  const currentStep = usePlayerStore((s) => s.currentStep);
  const stepsLength = usePlayerStore((s) => s.stepsLength);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const paused = usePlayerStore((s) => s.paused);
  const speedMs = usePlayerStore((s) => s.speedMs);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const awaitingReveal = usePlayerStore((s) => s.awaitingReveal);

  const mode = useNarrationStore((s) => s.mode);

  const predictEnabled = usePredictStore((s) => s.predictEnabled);

  const totalSteps = stepsLength || 1;
  const currentIndex = currentStep + 1;
  const pad3 = (n: number) => String(n).padStart(3, "0");
  const status = awaitingReveal
    ? "Predict"
    : isPlaying
      ? "Playing"
      : paused
        ? "Paused"
        : "Stopped";

  const forceTwoLines = mode === "explain" || predictEnabled;

  return (
    <div className="pt-3">
      {/* Description row */}
      <div className="flex items-center gap-3">
        <div
          className="
        group
        relative
        flex-1
        rounded-sm
        border border-tn-border
        bg-tn-surface/85
        pl-3
        pr-6   /* reserve space for top-right controls */
        pt-5   /* reserve vertical space */
        pb-2
      "
        >
          {/* Narration mode */}
          <div className="absolute top-0 right-1">
            <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-150">
              <NarrationModeSwitch />
            </div>
          </div>

          {/* Description text */}
          <div className="text-center">
            <div
              className={[
                "line-clamp-2 text-ui font-mono tracking-widest text-tn-text",
                "leading-[1.3rem]",
                forceTwoLines ? "min-h-[2.6rem]" : "",
                awaitingReveal ? "invisible" : "",
              ].join(" ")}
            >
              {description ?? "Ready."}
            </div>
          </div>
        </div>
      </div>

      {/* Controls (bottom section) */}
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Transport */}
        <div className="flex flex-col items-center shrink-0">
          <Transport />
          <div className="mt-1 text-xs font-mono text-tn-muted text-center whitespace-nowrap">
            {pad3(currentIndex)}
            <span className="text-tn-subtle"> / </span>
            {pad3(totalSteps)}
            <span className="mx-2 text-tn-subtle">·</span>
            <span className="text-tn-subtle/80">{status}</span>
          </div>
        </div>

        {/* Speed */}
        <div className="w-full md:w-[180px] shrink-0">
          <div className="w-full">
            <div className="mb-1 flex items-center justify-between md:hidden">
              <span className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
                Speed
              </span>
              <span className="text-xs font-mono text-tn-muted">
                {(1000 / speedMs).toFixed(1)}x
              </span>
            </div>

            <SpeedSlider value={speedMs} min={100} max={1050} onChange={setSpeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
