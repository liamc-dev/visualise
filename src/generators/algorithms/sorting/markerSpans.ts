// src/generators/algorithms/code/markerSpans.ts
import { MarkerParseResult, CodeSpan } from "../../../types/algo-types";

/**
 * Marker syntax:
 *   [[token]] ... [[/token]]
 *
 */
export function parseMarkerSpans(raw: string): MarkerParseResult {
  const spansByToken: Record<string, CodeSpan[]> = {};

  let out = "";
  let i = 0;

  // Track output position (line/col) as we build `out`
  let line = 1;
  let col = 0;

  const advance = (text: string) => {
    for (let k = 0; k < text.length; k++) {
      const ch = text[k];
      if (ch === "\n") {
        line++;
        col = 0;
      } else {
        col++;
      }
    }
  };

  // Token stack (no nesting recommended, but stack handles well-formed sequences)
  const open: Array<{ token: string; line: number; col: number }> = [];

  const readUntil = (needle: string) => {
    const idx = raw.indexOf(needle, i);
    if (idx === -1) return null;
    const text = raw.slice(i, idx);
    i = idx + needle.length;
    return text;
  };

  while (i < raw.length) {
    const startIdx = raw.indexOf("[[", i);
    if (startIdx === -1) {
      const tail = raw.slice(i);
      out += tail;
      advance(tail);
      break;
    }

    // emit plain text before marker
    const plain = raw.slice(i, startIdx);
    out += plain;
    advance(plain);
    i = startIdx;

    // attempt to read marker [[...]]
    const inside = readUntil("]]");
    if (inside == null) {
      // no closing, treat as plain
      const tail = raw.slice(startIdx);
      out += tail;
      advance(tail);
      break;
    }

    // inside includes leading [[ already consumed? no: we started at "[["
    // `readUntil` assumes i currently at marker start, so inside includes "[[" prefix
    // Let's normalize:
    const marker = inside.slice(2); // drop leading [[
    const trimmed = marker.trim();

    // close marker?
    if (trimmed.startsWith("/")) {
      const token = trimmed.slice(1).trim();
      const top = open.length ? open[open.length - 1] : null;

      // if mismatch, ignore (fail-soft)
      if (top && top.token === token) {
        open.pop();
        const fromLine = top.line;
        const fromCol = top.col;
        const toLine = line;
        const toCol = col;

        // single-line spans only (simpler). If multi-line, split into per-line spans.
        // We'll support multi-line by splitting.
        if (fromLine === toLine) {
          (spansByToken[token] ??= []).push({
            line: fromLine,
            from: fromCol,
            to: toCol,
          });
        } else {
          // split multi-line range into line-local spans
          // We need to reconstruct out slices line-by-line; easiest is approximate:
          // We'll store first line fromCol..EOL, middle full lines, last 0..toCol.
          // To do that precisely without keeping per-line lengths, we do a second pass later.
          // For now: do a second pass later (see below).
          (spansByToken[token] ??= []).push({
            line: fromLine,
            from: fromCol,
            to: -1, // sentinel "to end of line"
          });
          // middle lines unknown length => sentinel -1
          for (let l = fromLine + 1; l < toLine; l++) {
            (spansByToken[token] ??= []).push({
              line: l,
              from: 0,
              to: -1,
            });
          }
          (spansByToken[token] ??= []).push({
            line: toLine,
            from: 0,
            to: toCol,
          });
        }
      }
      continue;
    }

    // open marker
    const token = trimmed;
    open.push({ token, line, col });
  }

  // Fix any sentinel -1 "to end of line" using the final content
  if (Object.keys(spansByToken).length) {
    const lines = out.split("\n");
    for (const token of Object.keys(spansByToken)) {
      spansByToken[token] = spansByToken[token].map((s) => {
        if (s.to !== -1) return s;
        const lineText = lines[s.line - 1] ?? "";
        return { ...s, to: lineText.length };
      });
    }
  }

  return { content: out, spansByToken };
}
