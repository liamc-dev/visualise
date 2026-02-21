// src/components/player/PlayerBar.tsx
import type { ReactNode } from "react";
import NarrationModeSwitch from "../control/NarrationModeSwitch";
import { Panel } from "../ui/Panel";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { usePredictStore } from "../../stores/usePredictStore";
import { useNarrationStore } from "../../stores/useNarrationStore";

type Props = { description?: ReactNode };

export default function PlayerBar({ description }: Props) {
  const awaitingReveal = usePlayerStore((s) => s.awaitingReveal);
  const mode = useNarrationStore((s) => s.mode);
  const predictEnabled = usePredictStore((s) => s.predictEnabled);

  const forceTwoLines = mode === "explain" || predictEnabled;

  return (
    <div className="pt-3">
      {/* Description row */}
      <div className="flex items-center gap-3">
        <Panel
          tone="glass"
          radius="lg"
          className="group relative flex-1 pl-3 pr-6 pt-5 pb-2"
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
        </Panel>
      </div>
    </div>
  );
}
