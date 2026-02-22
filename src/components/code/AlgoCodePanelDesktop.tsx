import React, { useRef, useState } from "react";
import type { CodeBundle, CodeRef } from "../../types/algo-types";
import CodeLangSelect from "./CodeLangSelect";
import AlgoCodeMonacoHost from "./AlgoCodeMonacoHost";
import { Btn } from "../ui/Btn";
import { Panel } from "../ui/Panel";

import {
  Focus,
  Scan,
  RotateCcw,
  Eye,
  PenLine,
  GitCompare,
  ArrowLeft,
  X,
  Minus,
  Plus,
} from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";

export type ViewMode = "reference" | "recall" | "compare";

export default function AlgoCodePanelDesktop({
  algorithmId,
  codeBundle,
  codeRef,

  initialView = "reference",
  compareEnabled = true,
  showBackToReference = true,
  showRevealReference = false,
  headerLabel = "Code",
}: {
  algorithmId: string;
  codeBundle: CodeBundle;
  codeRef?: CodeRef;

  initialView?: ViewMode;
  compareEnabled?: boolean;
  showBackToReference?: boolean;
  showRevealReference?: boolean;
  headerLabel?: string;
}) {
  const [view, setView] = useState<ViewMode>(initialView);

  const isReference = view === "reference";
  const isRecall = view === "recall";
  const isCompare = view === "compare";

  const resetFnRef = useRef<null | (() => void)>(null);
  const [canReset, setCanReset] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
  const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize);

  return (
    <Panel tone="glass" className="min-w-0 w-full h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-1 pt-2 px-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 pl-1">
            {headerLabel}
          </span>

          <button
            type="button"
            onClick={() => setEditorFontSize(editorFontSize - 1)}
            disabled={editorFontSize <= 12}
            title="Decrease font size"
            aria-label="Decrease font size"
            className="text-tn-subtle/50 hover:text-tn-text disabled:opacity-30 transition-colors p-0.5"
          >
            <Minus size={12} />
          </button>

          <span className="text-[10px] text-tn-subtle/50 w-4 text-center select-none tabular-nums">
            {editorFontSize}
          </span>

          <button
            type="button"
            onClick={() => setEditorFontSize(editorFontSize + 1)}
            disabled={editorFontSize >= 20}
            title="Increase font size"
            aria-label="Increase font size"
            className="text-tn-subtle/50 hover:text-tn-text disabled:opacity-30 transition-colors p-0.5"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Reference header actions */}
          {isReference && (
            <Btn
              onClick={() => setView("recall")}
              title="Recall mode (write from skeleton)"
            >
              <PenLine size={16} strokeWidth={1.5} />
              Recall
            </Btn>
          )}

          {/* Recall header actions */}
          {isRecall && (
            <>
              <Btn
                size="icon"
                variant="ghost"
                onClick={() => resetFnRef.current?.()}
                title="Reset to skeleton"
                disabled={!canReset}
                aria-label="Reset"
              >
                <RotateCcw size={16} strokeWidth={1.5} />
              </Btn>

              <Btn
                onClick={() => setView("compare")}
                title={
                  compareEnabled
                    ? "Compare your attempt to canonical"
                    : "Compare unlocks after you submit an attempt"
                }
                disabled={!compareEnabled}
              >
                <GitCompare size={16} strokeWidth={1.5} />
                Compare
              </Btn>

              {showBackToReference && (
                <Btn
                  onClick={() => setView("reference")}
                  title="Back to reference"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  Back
                </Btn>
              )}
            </>
          )}

          {/* Compare header actions */}
          {isCompare && (
            <>
              <Btn
                onClick={() => setView("recall")}
                title="Back to recall editor"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
                Back to edit
              </Btn>

              <Btn
                onClick={() =>
                  setView(showBackToReference ? "reference" : "recall")
                }
                title="Exit compare"
              >
                <X size={16} strokeWidth={1.5} />
                Exit
              </Btn>
            </>
          )}

          {/* Reveal reference */}
          {showRevealReference && isRecall && (
            <Btn
              size="icon"
              variant="ghost"
              onClick={() => setView("reference")}
              title="Reveal reference (avoid unless necessary)"
              aria-label="Reveal reference"
            >
              <Eye size={16} strokeWidth={1.5} />
            </Btn>
          )}

          {showRevealReference && isReference && (
            <Btn onClick={() => setView("recall")} title="Back to recall">
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back to recall
            </Btn>
          )}

          {/* Focus mode */}
          {isReference && (
            <Btn
              size="icon"
              variant="ghost"
              pressed={focusMode}
              onClick={() => setFocusMode((v) => !v)}
              title="Focus mode"
              aria-pressed={focusMode}
              aria-label="Focus mode"
            >
              {focusMode ? <Scan size={16} strokeWidth={1.5} /> : <Focus size={16} strokeWidth={1.5} />}
            </Btn>
          )}

          <CodeLangSelect bundle={codeBundle} />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AlgoCodeMonacoHost
          view={view}
          algorithmId={algorithmId}
          codeBundle={codeBundle}
          codeRef={codeRef}
          focusMode={focusMode}
          onResetRecall={(fn) => {
            resetFnRef.current = fn;
          }}
          onRecallReady={({ canReset }) => setCanReset(canReset)}
        />
      </div>
    </Panel>
  );
}
