import { usePlayerStore } from "../../stores/usePlayerStore";
import type { ReactNode } from "react";
import { useHoldRepeat } from "../../hooks/useHoldRepeat";
import { SpeedSlider } from "./SpeedSlider";
import { SkipBack, SkipForward, Play, Pause, Square } from "lucide-react";

type PlayerControlsProps = {
  description?: ReactNode;
};

export default function PlayerControls({ description }: PlayerControlsProps) {
  const {
    currentStep,
    stepsLength,
    atFirstStep,
    atLastStep,
    isPlaying,
    paused,
    nextStep,
    prevStep,
    setPlaying,
    setPaused,
    reset,
    speedMs,
  } = usePlayerStore();

  const totalSteps = stepsLength || 1;
  const currentIndex = currentStep + 1;
  const pad3 = (n: number) => String(n).padStart(3, "0");

  const isFirst = atFirstStep();
  const isLast = atLastStep();

  const holdNext = useHoldRepeat(() => {
    if (!isLast) nextStep();
  }, { enabled: !isLast, delay: 400, interval: 90 });

  const holdPrev = useHoldRepeat(() => {
    if (!isFirst) prevStep();
  }, { enabled: !isFirst, delay: 400, interval: 90 });

  return (
    <div className="w-full max-w-full mb-4 px-2 rounded-2xl border border-tn-border bg-tn-card shadow-sm">
      <div className="px-5 py-2">
        {/* 3-column layout on md+, stacks on small */}
        <div className="grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
          {/* LEFT COLUMN: readout + transport */}
          <div className="flex flex-col items-center text-center">
            {/* Step readout */}
            <div>
             
              <div className="mt-1 flex items-center justify-center gap-2">
                <div className="font-mono text-[13px] text-tn-text">
                  {pad3(currentIndex)}
                  <span className="text-tn-subtle"> / </span>
                  <span className="text-tn-muted">{pad3(totalSteps)}</span>
                </div>

                <span
                  className={
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border " +
                    (isPlaying
                      ? "border-tn-success/30 bg-tn-success/15 text-tn-success"
                      : paused
                        ? "border-tn-warning/30 bg-tn-warning/15 text-tn-warning"
                        : "border-tn-border bg-tn-surfaceSoft text-tn-muted")
                  }
                >
                  {isPlaying ? "Playing" : paused ? "Paused" : "Stopped"}
                </span>
              </div>
            </div>

            {/* Transport group */}
            <div className="mt-3 inline-flex items-center gap-1 rounded-xl border border-tn-border bg-tn-surfaceSoft p-1 w-fit">
              <button
                type="button"
                {...holdPrev}
                disabled={isFirst}
                className="
                  h-10 w-10 rounded-lg grid place-items-center
                  text-tn-text hover:bg-tn-surface
                  disabled:opacity-40 disabled:hover:bg-transparent
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/35
                "
                aria-label="Previous"
                title="Previous"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    setPlaying(false);
                    setPaused(true);
                  } else {
                    setPaused(false);
                    setPlaying(true);
                  }
                }}
                className={
                  "h-10 w-10 rounded-lg grid place-items-center border transition " +
                  (isPlaying
                    ? "border-tn-danger/35 bg-tn-danger/15 text-tn-danger hover:bg-tn-danger/20"
                    : "border-tn-success/35 bg-tn-success/15 text-tn-success hover:bg-tn-success/20")
                }
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                type="button"
                onClick={reset}
                className="
                  h-10 w-10 rounded-lg grid place-items-center
                  text-tn-text hover:bg-tn-surface
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/35
                "
                aria-label="Stop"
                title="Stop"
              >
                <Square size={18} />
              </button>

              <button
                type="button"
                {...holdNext}
                disabled={isLast}
                className="
                  h-10 w-10 rounded-lg grid place-items-center
                  text-tn-text hover:bg-tn-surface
                  disabled:opacity-40 disabled:hover:bg-transparent
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/35
                "
                aria-label="Next"
                title="Next"
              >
                <SkipForward size={18} />
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: description banner */}
          <div className="min-w-0 flex justify-center md:justify-center">
            <div
              className="
                w-full max-w-[560px]
                rounded-xl border border-tn-border/70
                bg-tn-surfaceSoft/70
                px-3 py-2
                text-center
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              "
            >
              <div className="flex items-center justify-center gap-2">

                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-tn-subtle">
                    Current step
                  </div>

                  <div
                    key={typeof description === "string" ? description : undefined}
                    className="
    mt-1
    text-sm
    leading-relaxed
    font-semibold
    text-tn-text
    truncate
  "
                    title={typeof description === "string" ? description : undefined}
                  >
                    {description ?? "Ready."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: slider */}
          <div className="shrink-0 justify-self-center md:justify-self-end">
            <SpeedSlider
              value={speedMs}
              min={100}
              max={1050}
              onChange={(v) => usePlayerStore.getState().setSpeed(v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
