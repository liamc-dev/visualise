import { usePlayerStore } from "../../stores/usePlayerStore";
import { useHoldRepeat } from "../../hooks/useHoldRepeat";
import { SpeedKnob } from "./SpeedKnob";

export default function PlayerControls() {
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
    activeLeds,
    speedMs,
  } = usePlayerStore();

  const totalSteps = stepsLength || 1;
  const currentIndex = currentStep + 1;
  const pad3 = (n: number) => String(n).padStart(3, "0");

  const isFirst = atFirstStep();
  const isLast = atLastStep();
  const leds = activeLeds();

  const holdNext = useHoldRepeat(
    () => {
      if (!isLast) nextStep();
    },
    { enabled: !isLast, delay: 400, interval: 90 }
  );

  const holdPrev = useHoldRepeat(
    () => {
      if (!isFirst) prevStep();
    },
    { enabled: !isFirst, delay: 400, interval: 90 }
  );

  return (
    <div
      className="
        w-full max-w-full mb-4 px-4 py-3
        rounded-[1.4rem]
        border border-tn-border
        bg-tn-surface/90 backdrop-blur-sm
        shadow-[0_0_25px_rgba(0,0,0,0.6)]
        relative
        before:content-[''] before:absolute before:inset-0
        before:rounded-[1.35rem]
        before:border before:border-tn-border/40
        before:pointer-events-none
        stepatron-panel
      "
    >
      {/* Header */}
      <div className="w-full flex items-center justify-start absolute">
        <span className="tn-step-module-name">STEP-A-TRON™</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">

        {/* PWR LED */}
        <div className="flex items-center gap-1 opacity-80 select-none">
          <span
            className={`
              w-2.5 h-2.5 rounded-full
              shadow-[0_0_6px_rgba(158,206,106,0.7)]
              tn-crt-pulse-led
              ${isPlaying ? "bg-tn-success" : "bg-tn-warning"}
            `}
          />
          <span className="text-[0.55rem] tracking-widest text-tn-subtle uppercase">
            PWR
          </span>
        </div>

        {/* Main Unit */}
        <div className="flex-shrink-0 ml-18">
          <div className="tn-step-module">

            {/* Step Display */}
            <div className="tn-step-display">
              <span className="tn-step-digit-main tn-crt-pulse">{pad3(currentIndex)}</span>
              <span className="tn-step-display-dim">/</span>
              <span className="tn-step-digit-total tn-crt-pulse-soft">
                {pad3(totalSteps)}
              </span>
            </div>

            {/* LED Strip — rotating indicator (low power) */}
            <div className="tn-step-led-strip">
              {Array.from({ length: 10 }).map((_, i) => {
                const activeIndex = currentStep % 10;
                const isActive = i === activeIndex;

                return (
                  <span
                    key={i}
                    className={`tn-step-led ${isActive ? "is-active" : ""}`}
                  />
                );
              })}
            </div>

            {/* Transport Controls */}
            <div className="tn-step-transport-row">

              {/* REW */}
              <button
                type="button"
                {...holdPrev}
                disabled={isFirst}
                className="tn-step-transport-btn"
              >
                <span className="tn-transport-icon tn-transport-icon-triangle tn-transport-icon-rew" />
              </button>

              {/* PLAY / PAUSE */}
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
                  "tn-step-transport-btn " +
                  (isPlaying ? "tn-transport-pause" : paused ? "tn-transport-play" : "")
                }
              >
                <span
                  className={
                    isPlaying
                      ? "tn-transport-icon tn-transport-icon-pause"
                      : "tn-transport-icon tn-transport-icon-triangle tn-transport-icon-play"
                  }
                />
              </button>

              {/* STOP */}
              <button
                type="button"
                onClick={reset}
                className="tn-step-transport-btn"
              >
                <span className="tn-transport-icon tn-transport-icon-stop" />
              </button>

              {/* FWD */}
              <button
                type="button"
                {...holdNext}
                disabled={isLast}
                className="tn-step-transport-btn"
              >
                <span className="tn-transport-icon tn-transport-icon-triangle tn-transport-icon-fwd" />
              </button>

            </div>
          </div>
        </div>

        {/* Speed Knob */}
        <div className="flex-1" />
        <div className="flex flex-col items-center mr-2">
          <SpeedKnob
            value={speedMs}
            min={100}
            max={1050}
            onChange={(v) => usePlayerStore.getState().setSpeed(v)}
          />
        </div>
      </div>
    </div>
  );
}
