import React from "react";
import ResizableSplit from "./ResizableSplit";
import { useLayoutStore } from "../../stores/useLayoutStore";

type AlgoWorkspaceShellProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  minLeftPx?: number;
  minRightPx?: number;
};

export default function AlgoWorkspaceShell({
  left,
  right,
  minLeftPx = 420,
  minRightPx = 520,
}: AlgoWorkspaceShellProps) {
  const splitRatio = useLayoutStore((s) => s.splitRatio);
  const setSplitRatio = useLayoutStore((s) => s.setSplitRatio);
  const resetSplitRatio = useLayoutStore((s) => s.resetSplitRatio);
  const hasHydrated = useLayoutStore((s) => s.hasHydrated);

  return (
    <div className="px-0 py-0 text-tn-text h-full min-h-0">
      <div className="mx-auto w-full h-full min-h-0">

        {/* Mobile / tablet */}
        <div className="grid grid-cols-1 gap-2 xl:hidden">
          {left}
          {right}
        </div>

        {/* Desktop resizable */}
        <div className="hidden xl:block h-full min-h-0">
          {hasHydrated && (
            <ResizableSplit
              ratio={splitRatio}
              onRatioChange={setSplitRatio}
              onReset={resetSplitRatio}
              minLeftPx={minLeftPx}
              minRightPx={minRightPx}
              left={left}
              right={right}
            />
          )}
        </div>

      </div>
    </div>
  );
}
