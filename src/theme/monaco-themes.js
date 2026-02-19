// src/utils/monaco-themes.js

function clamp255(n) {
    n = Number(n);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r, g, b) {
    const rr = clamp255(r).toString(16).padStart(2, "0");
    const gg = clamp255(g).toString(16).padStart(2, "0");
    const bb = clamp255(b).toString(16).padStart(2, "0");
    return `#${rr}${gg}${bb}`;
}

function hex6(hex) {
    // "#RRGGBB" -> "#RRGGBB", "#RRGGBBAA" -> "#RRGGBB"
    return typeof hex === "string" && hex.length === 9 ? hex.slice(0, 7) : hex;
}

/**
 * Reads CSS var like "--tn-text" which is stored as "15 23 42"
 * Returns hex like "#0f172a"
 */
function cssRgbVarToHex(varName, fallback = "#000000") {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!v) return fallback;

    // expect "r g b"
    const parts = v.split(/\s+/).map(Number);
    if (parts.length < 3) return fallback;
    return rgbToHex(parts[0], parts[1], parts[2]);
}

function withAlpha(hex, alpha01) {
    // Monaco supports 8-digit hex: #RRGGBBAA
    const a = Math.max(0, Math.min(1, alpha01));
    const aa = Math.round(a * 255).toString(16).padStart(2, "0");
    return `${hex}${aa}`;
}

/**
 *
 */
export function defineLightTn(monaco) {
    const _bg = cssRgbVarToHex("--tn-bg", "#ffffff");
    const surface = cssRgbVarToHex("--tn-surface", "#ffffff");
    const surfaceSoft = cssRgbVarToHex("--tn-surfaceSoft", "#f6f8fa");
    const border = cssRgbVarToHex("--tn-border", "#d0d7de");
    const text = cssRgbVarToHex("--tn-text", "#2d6ab3");
    const muted = cssRgbVarToHex("--tn-muted", "#57606a");
    const subtle = cssRgbVarToHex("--tn-subtle", "#6e7781");
    const accent = cssRgbVarToHex("--tn-accent", "#0969da");
    const cyan = cssRgbVarToHex("--tn-cyan", "#1b7c83");
    const magenta = cssRgbVarToHex("--tn-magenta", "#8250df");
    const danger = cssRgbVarToHex("--tn-danger", "#cf222e");
    const success = cssRgbVarToHex("--tn-success", "#1a7f37");
    const warning = cssRgbVarToHex("--tn-warning", "#9a6700");


    const lineHighlight = withAlpha(accent, 0.08);     // subtle active line wash
    const selection = withAlpha(accent, 0.18);         // selection
    const selectionInactive = withAlpha(accent, 0.10);
    const findMatch = withAlpha(warning, 0.25);
    const hoverBg = surfaceSoft;
    const _indentGuide = withAlpha(border, 0.9);

    monaco.editor.defineTheme("tn-light", {
        base: "vs",
        inherit: true,
        rules: [
            { token: "", foreground: hex6(text).slice(1) },
            { token: "comment", foreground: hex6(subtle).slice(1), fontStyle: "italic" },
            { token: "string", foreground: hex6(success).slice(1) },
            { token: "keyword", foreground: hex6(accent).slice(1) },
            { token: "number", foreground: hex6(warning).slice(1) },
            { token: "delimiter", foreground: hex6(muted).slice(1) },
            { token: "type.identifier", foreground: hex6(magenta).slice(1) },
            { token: "identifier", foreground: hex6(text).slice(1) },
            { token: "annotation", foreground: hex6(cyan).slice(1) },
            { token: "class", foreground: hex6(magenta).slice(1) },
            { token: "interface", foreground: hex6(magenta).slice(1) },
            { token: "method", foreground: hex6(accent).slice(1) },
            { token: "field", foreground: hex6(text).slice(1) },
        ],
        colors: {
            "editor.background": surface,
            "editor.foreground": text,
            "editorLineNumber.foreground": withAlpha(muted, 0.55),
            "editorLineNumber.activeForeground": withAlpha(muted, 0.95),

            // Cursor + selection
            "editorCursor.foreground": withAlpha(text, 0.85),
            "editor.selectionBackground": selection,
            "editor.inactiveSelectionBackground": selectionInactive,
            "editor.selectionHighlightBackground": withAlpha(accent, 0.10),

            // Active line + word highlight
            "editor.lineHighlightBackground": lineHighlight,
            "editor.wordHighlightBackground": withAlpha(accent, 0.14),
            "editor.wordHighlightStrongBackground": withAlpha(accent, 0.18),

            // Find
            "editor.findMatchBackground": findMatch,
            "editor.findMatchHighlightBackground": withAlpha(warning, 0.16),
            "editor.findRangeHighlightBackground": withAlpha(warning, 0.12),

            // Brackets
            "editorBracketMatch.background": withAlpha(accent, 0.10),
            "editorBracketMatch.border": withAlpha(accent, 0.25),

            // Indent guides
            "editorIndentGuide.background1": withAlpha(border, 0.6),
            "editorIndentGuide.activeBackground1": withAlpha(border, 0.9),

            // Gutter + guides
            "editorGutter.background": surface,
            "editorRuler.foreground": withAlpha(border, 0.7),

            // Hover / widgets
            "editorHoverWidget.background": hoverBg,
            "editorHoverWidget.border": withAlpha(border, 0.9),
            "editorWidget.background": hoverBg,
            "editorWidget.border": withAlpha(border, 0.9),

            // Errors / warnings
            "editorError.foreground": danger,
            "editorWarning.foreground": warning,
            "editorInfo.foreground": accent,

            // Scrollbar
            "scrollbarSlider.background": withAlpha(accent, 0.18),
            "scrollbarSlider.hoverBackground": withAlpha(accent, 0.26),
            "scrollbarSlider.activeBackground": withAlpha(accent, 0.34),

            // Minimap
            "minimap.selectionHighlight": withAlpha(accent, 0.25),

            // ----------------------------
            // Diff editor (calm / low-saturation)
            // ----------------------------

            // Insertions (green)
            "diffEditor.insertedLineBackground": withAlpha(success, 0.08),
            "diffEditor.insertedTextBackground": withAlpha(success, 0.14),

            // Removals (red)
            "diffEditor.removedLineBackground": withAlpha(danger, 0.06),
            "diffEditor.removedTextBackground": withAlpha(danger, 0.12),

            // Borders / diagonal stripe fill (make invisible)
            "diffEditor.border": withAlpha(border, 0.0),
            "diffEditor.diagonalFill": withAlpha(border, 0.0),

            // Overview ruler (hide the loud right-side diff markers)
            "editorOverviewRuler.addedForeground": withAlpha(success, 0.0),
            "editorOverviewRuler.deletedForeground": withAlpha(danger, 0.0),
            "editorOverviewRuler.modifiedForeground": withAlpha(warning, 0.0),
        },
    });

    monaco.editor.setTheme("tn-light");
}

export function defineDarkTn(monaco) {
    // Keep vs-dark, only soften diff visuals
    monaco.editor.defineTheme("tn-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            // ----------------------------
            // Diff editor
            // ----------------------------
            "diffEditor.insertedLineBackground": "#2e7d320c",
            "diffEditor.insertedTextBackground": "#2e7d3212",
            "diffEditor.removedLineBackground": "#c6282805",
            "diffEditor.removedTextBackground": "#c6282804",

            // Borders / hatch
            "diffEditor.diagonalFill": "#00000000",
            "diffEditor.border": "#00000000",


            "diffEditor.insertedLineBorder": "#00000000",
            "diffEditor.removedLineBorder": "#00000000",


            "diffEditor.move.border": "#00000000",


            "diffEditor.unchangedRegionBackground": "#00000000",
            "diffEditor.unchangedRegionForeground": "#9ca3af80",

            "scrollbar.shadow": "#00000025",
            "scrollbarSlider.background": "rgba(255,255,255,0.08)",
            "scrollbarSlider.hoverBackground": "rgba(255,255,255,0.12)",
            "scrollbarSlider.activeBackground": "rgba(255,255,255,0.18)",

            // // Overview ruler diff markers
            // "editorOverviewRuler.addedForeground": "#00000000",
            // "editorOverviewRuler.deletedForeground": "#00000000",
            // "editorOverviewRuler.modifiedForeground": "#00000000",
        },
    });
}


