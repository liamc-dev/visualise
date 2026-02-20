// src/components/code/AlgoCodeMonacoHost.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { DiffEditor, useMonaco } from "@monaco-editor/react";
import type { CodeBundle, CodeRef } from "../../types/algo-types";
import { useCodeLangStore } from "../../stores/useCodeLangStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { defineLightTn, defineDarkTn } from "../../theme/monaco-themes";
import { EDITOR_LANG_MAP } from "../../types/algo-types";
import { useCodeDraftStore } from "../../stores/useCodeDraftStore";

type ViewMode = "reference" | "recall" | "compare";

export default function AlgoCodeMonacoHost({
    view,
    algorithmId,
    codeBundle,
    codeRef,
    focusMode,
    onResetRecall,
    onRecallReady,
}: {
    view: ViewMode;
    algorithmId: string;
    codeBundle: CodeBundle;
    codeRef?: CodeRef;
    focusMode?: boolean;
    onResetRecall?: (resetFn: () => void) => void;
    onRecallReady?: (state: { canReset: boolean }) => void;
}) {
    const monaco = useMonaco();

    const lang = useCodeLangStore((s) => s.lang);
    const themeKey = useThemeStore((s) => s.theme);
    const isLightTheme = themeKey === "light" || themeKey === "ember";
    const themeName = `tn-${themeKey}`;

    const languageId = useMemo(() => EDITOR_LANG_MAP[lang] ?? "plaintext", [lang]);

    const canonicalContent = useMemo(() => {
        const source = codeBundle.sources[lang] ?? codeBundle.sources.pseudo;
        return source?.content ?? "";
    }, [codeBundle, lang]);

    const recallSkeleton = useMemo(() => {
        return (
            codeBundle.sources[lang]?.skeleton ??
            codeBundle.sources.pseudo?.skeleton ??
            ""
        );
    }, [codeBundle, lang]);

    const draftKey = useMemo(
        () => `recall:draft:${algorithmId}:${lang}`,
        [algorithmId, lang]
    );


    const draft = useCodeDraftStore((s) => s.drafts[draftKey] ?? "");
    const setDraft = useCodeDraftStore((s) => s.setDraft);

    // Theme
    useEffect(() => {
        if (!monaco) return;
        if (isLightTheme) defineLightTn(monaco, themeName);
        else defineDarkTn(monaco, themeName);
        monaco.editor.setTheme(themeName);
    }, [monaco, isLightTheme, themeName]);
    // ----------------------------
    // Reference editor decorations
    // ----------------------------
    const refEditorRef = useRef<any>(null);
    const decorationIdsRef = useRef<string[]>([]);
    const lastRevealRef = useRef<number | null>(null);

    useEffect(() => {
        if (!monaco) return;
        const editor = refEditorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const [start, end] = codeRef?.lines ?? [0, 0];
        const spans = codeRef?.spans ?? [];

        const newDecorations: any[] = [];

        if (focusMode) {
            const lastLine = model.getLineCount();
            const lastCol = model.getLineMaxColumn(lastLine);
            newDecorations.push({
                range: new monaco.Range(1, 1, lastLine, lastCol),
                options: { inlineClassName: "acp-dim" },
            });
        }

        if (start > 0 && end >= start) {
            const endSafe = Math.min(end, model.getLineCount());
            const endCol = model.getLineMaxColumn(endSafe);

            newDecorations.push({
                range: new monaco.Range(start, 1, endSafe, 1),
                options: { isWholeLine: true, className: "acp-line-highlight" },
            });

            if (focusMode) {
                newDecorations.push({
                    range: new monaco.Range(start, 1, endSafe, endCol),
                    options: { inlineClassName: "acp-undim" },
                });
            }
        }

        for (const s of spans) {
            const line = Math.max(1, s.line);
            if (line > model.getLineCount()) continue;

            const from = Math.max(1, s.from + 1);
            const to = Math.max(from, s.to + 1);

            newDecorations.push({
                range: new monaco.Range(line, from, line, to),
                options: { inlineClassName: "acp-span-highlight" },
            });

            if (focusMode) {
                newDecorations.push({
                    range: new monaco.Range(line, from, line, to),
                    options: { inlineClassName: "acp-undim" },
                });
            }
        }

        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);

        if (start > 0 && start !== lastRevealRef.current) {
            editor.revealLineInCenterIfOutsideViewport(start, monaco.editor.ScrollType.Smooth);
            lastRevealRef.current = start;
        }
    }, [monaco, codeRef, focusMode, canonicalContent]);


    useEffect(() => {
        if (view === "reference") return;

        const editor = refEditorRef.current;
        if (!editor) return;

        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
        lastRevealRef.current = null;
    }, [view]);


    // ----------------------------
    // Recall editor focus
    // ----------------------------
    const recallEditorRef = useRef<any>(null);

    useEffect(() => {
        if (view !== "recall") return;
        requestAnimationFrame(() => recallEditorRef.current?.focus?.());
    }, [view, draftKey]);

    // ----------------------------
    // Seed recall with skeleton
    // ----------------------------
    useEffect(() => {
        if (view !== "recall") return;
        if (draft.trim().length > 0) return;
        if (!recallSkeleton.trim()) return;

        setDraft(draftKey, recallSkeleton);
    }, [view, draft, recallSkeleton, draftKey, setDraft]);

    // ----------------------------
    // Reset function
    // ----------------------------
    const resetToSkeleton = useCallback(() => {
        setDraft(draftKey, recallSkeleton ?? "");
    }, [setDraft, draftKey, recallSkeleton]);

    useEffect(() => {
        onResetRecall?.(resetToSkeleton);
    }, [onResetRecall, resetToSkeleton]);

    useEffect(() => {
        if (!onRecallReady) return;
        const canReset = Boolean(recallSkeleton && recallSkeleton.trim().length > 0);
        onRecallReady({ canReset });
    }, [onRecallReady, recallSkeleton]);

    // ----------------------------
    // Compare
    // ----------------------------
    const [hasMountedCompare, setHasMountedCompare] = useState(false);
    useEffect(() => {
        if (view === "compare") setHasMountedCompare(true);
    }, [view]);

    const baseOptions = {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "off",
        lineNumbers: "on",
        fontSize: 13,
        lineHeight: 18,
        fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        scrollbar: {
            vertical: "auto" as const,
            horizontal: "hidden" as const,
            verticalScrollbarSize: 8,
            useShadows: false,
        },
    } as const;

    return (
        <div className="tn-monaco h-full min-h-0 w-full overflow-hidden rounded-b-xl relative">
            {/* Reference */}
            <div
                className="absolute inset-0"
                style={{ display: view === "reference" ? "block" : "none" }}
            >
                <Editor
                    height="99%"
                    language={languageId}
                    value={canonicalContent}
                    theme={themeName}
                    options={{
                        ...baseOptions,
                        readOnly: true,
                        domReadOnly: true,
                        contextmenu: false,
                        folding: false,
                        renderLineHighlight: "none",
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                    onMount={(editor) => {
                        refEditorRef.current = editor;
                    }}
                />
            </div>

            {/* Recall */}
            <div
                className="absolute inset-0"
                style={{ display: view === "recall" ? "block" : "none" }}
            >
                <Editor
                    height="99%"
                    language={languageId}
                    value={draft}
                    theme={themeName}
                    options={{
                        ...baseOptions,
                        readOnly: false,
                        contextmenu: true,
                        folding: true,
                    }}
                    onChange={(val) => setDraft(draftKey, val ?? "")}
                    onMount={(editor) => {
                        recallEditorRef.current = editor;
                        requestAnimationFrame(() => editor.focus());
                    }}
                />
            </div>

            {/* Compare */}
            {hasMountedCompare && (
                <div
                    className="absolute inset-0"
                    style={{ display: view === "compare" ? "block" : "none" }}
                >
                    <DiffEditor
                        key={`diff:${algorithmId}:${lang}`}
                        height="99%"
                        language={languageId}
                        theme={themeName}
                        original={canonicalContent}
                        modified={draft}
                        options={{
                            ...baseOptions,
                            renderSideBySide: true,
                            renderSideBySideInlineBreakpoint: 0,


                            diffAlgorithm: "advanced",
                            hideUnchangedRegions: {
                                enabled: true,
                                revealLineCount: 2,
                                minimumLineCount: 5,
                            },

                            renderIndicators: false,
                            diffWordWrap: "off",
                            ignoreTrimWhitespace: true,
                            renderOverviewRuler: false,

                            enableSplitViewResizing: true,
                            readOnly: false,
                            originalEditable: false,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
