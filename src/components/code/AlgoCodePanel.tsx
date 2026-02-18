// src/components/code/AlgoCodePanel.tsx
import React, { useMemo } from "react";
import type { CodeRef, CodeBundle, CodeSpan } from "../../types/algo-types";
import { useCodeLangStore } from "../../stores/useCodeLangStore";
import CodeLangSelect from "./CodeLangSelect";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function renderLineWithSpans(line: string, spans: CodeSpan[], lineNo: number) {
  const lineSpans = spans
    .filter((s) => s.line === lineNo)
    .map((s) => ({
      from: clamp(s.from, 0, line.length),
      to: clamp(s.to, 0, line.length),
    }))
    .filter((s) => s.to > s.from)
    .sort((a, b) => a.from - b.from);

  if (!lineSpans.length) return line;

  // Merge overlaps
  const merged: Array<{ from: number; to: number }> = [];
  for (const s of lineSpans) {
    const last = merged[merged.length - 1];
    if (!last || s.from > last.to) merged.push({ ...s });
    else last.to = Math.max(last.to, s.to);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const s of merged) {
    if (cursor < s.from) {
      parts.push(
        <span key={`t-${lineNo}-${cursor}`} className="whitespace-pre">
          {line.slice(cursor, s.from)}
        </span>
      );
    }

    parts.push(
      <span
        key={`h-${lineNo}-${s.from}-${s.to}`}
        className={[
          "relative inline whitespace-pre",
          "text-tn-text",
          "font-medium",
          "leading-[1]",
          "before:content-['']",
          "before:absolute",
          "before:inset-[-1px_-3px]",
          "before:bg-tn-accent/20",
          "before:rounded-[4px]",
          "before:-z-10",
        ].join(" ")}
      >
        {line.slice(s.from, s.to)}
      </span>
    );

    cursor = s.to;
  }

  if (cursor < line.length) {
    parts.push(
      <span key={`t-${lineNo}-end`} className="whitespace-pre">
        {line.slice(cursor)}
      </span>
    );
  }

  return parts;
}

export default function AlgoCodePanel({
  codeBundle,
  codeRef,
}: {
  codeBundle: CodeBundle;
  codeRef?: CodeRef;
}) {
  const lang = useCodeLangStore((s) => s.lang);

  const source = codeBundle.sources[lang] ?? codeBundle.sources.pseudo;
  const content = source?.content ?? "";
  const lines = content ? content.split("\n") : [];

  const [start, end] = codeRef?.lines ?? [0, 0];
  const spans = codeRef?.spans ?? [];

  // quick lookup: which lines have spans?
  const spanLineSet = useMemo(() => {
    const set = new Set<number>();
    for (const s of spans) set.add(s.line);
    return set;
  }, [spans]);

  return (
    <div className="rounded-2xl border border-tn-border bg-tn-surface/85 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
            Code
          </div>
        </div>

        <CodeLangSelect bundle={codeBundle} />
      </div>

      {!content ? (
        <div className="text-xs text-tn-muted">No code available.</div>
      ) : (
        <pre className="text-xs leading-5 font-mono whitespace-pre overflow-auto tn-codeblock">
          <code>
            {lines.map((line, idx) => {
              const lineNo = idx + 1;

              const isLineActive =
                start > 0 && lineNo >= start && lineNo <= end;

              const hasSpan = spanLineSet.has(lineNo);

              // if spans exist for this line, render spans; otherwise render plain line
              const rendered = hasSpan
                ? renderLineWithSpans(line, spans, lineNo)
                : line;

              return (
                <div
                  key={lineNo}
                  className={[
                    "px-2",
                    // Keep whitespace consistent even with spans
                    "whitespace-pre",
                    // If line highlight active but there are spans too,
                    // keep line subtle so spans are the focus.
                    isLineActive && !hasSpan
                      ? "bg-tn-accent/20 text-tn-text"
                      : isLineActive && hasSpan
                        ? "bg-tn-accent/12 text-tn-text"
                        : "text-tn-text/90"
                  ].join(" ")}
                >
                  {rendered}
                </div>
              );
            })}
          </code>
        </pre>
      )}
    </div>
  );
}
