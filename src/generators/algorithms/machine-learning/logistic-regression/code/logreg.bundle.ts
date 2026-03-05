import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  LOGREG_PSEUDO,
  LOGREG_PSEUDO_POINTER_HINTS,
  LOGREG_PSEUDO_POINTER_LABELS,
} from "./logreg-pseudo";

import {
  LOGREG_CPP,
  LOGREG_CPP_POINTER_HINTS,
  LOGREG_CPP_POINTER_LABELS,
} from "./logreg-cpp";

import {
  LOGREG_JAVA,
  LOGREG_JAVA_POINTER_HINTS,
  LOGREG_JAVA_POINTER_LABELS,
} from "./logreg-java";

import {
  LOGREG_TS,
  LOGREG_TS_POINTER_HINTS,
  LOGREG_TS_POINTER_LABELS,
} from "./logreg-ts";

import {
  LOGREG_JS,
  LOGREG_JS_POINTER_HINTS,
  LOGREG_JS_POINTER_LABELS,
} from "./logreg-js";

import {
  LOGREG_PY,
  LOGREG_PY_POINTER_HINTS,
  LOGREG_PY_POINTER_LABELS,
} from "./logreg-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(LOGREG_PSEUDO);
const cppParsed = parseMarkerSpans(LOGREG_CPP);
const javaParsed = parseMarkerSpans(LOGREG_JAVA);
const tsParsed = parseMarkerSpans(LOGREG_TS);
const jsParsed = parseMarkerSpans(LOGREG_JS);
const pyParsed = parseMarkerSpans(LOGREG_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const LOGREG_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "logreg.pseudo", content: pseudoParsed.content },
    cpp: { file: "logreg.cpp", content: cppParsed.content },
    java: { file: "logreg.java", content: javaParsed.content },
    ts: { file: "logreg.ts", content: tsParsed.content },
    js: { file: "logreg.js", content: jsParsed.content },
    py: { file: "logreg.py", content: pyParsed.content },
  },

  spanMaps: {
    pseudo: pseudoParsed.spansByToken,
    cpp: cppParsed.spansByToken,
    java: javaParsed.spansByToken,
    ts: tsParsed.spansByToken,
    js: jsParsed.spansByToken,
    py: pyParsed.spansByToken,
  },

  resolve(lang: CodeLang, token: string) {
    const file = this.sources[lang]?.file ?? this.sources.pseudo?.file ?? "";

    let lines: [number, number] | undefined;
    const spans = this.spanMaps?.[lang]?.[token];

    if (spans) {
      const minLine = Math.min(...spans.map(s => s.line));
      const maxLine = Math.max(...spans.map(s => s.line));
      lines = [minLine, maxLine];
    }

    return { file, lines, spans };
  },

  pointerHints: {
    pseudo: LOGREG_PSEUDO_POINTER_HINTS,
    cpp: LOGREG_CPP_POINTER_HINTS,
    java: LOGREG_JAVA_POINTER_HINTS,
    ts: LOGREG_TS_POINTER_HINTS,
    js: LOGREG_JS_POINTER_HINTS,
    py: LOGREG_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: LOGREG_PSEUDO_POINTER_LABELS,
    cpp: LOGREG_CPP_POINTER_LABELS,
    java: LOGREG_JAVA_POINTER_LABELS,
    ts: LOGREG_TS_POINTER_LABELS,
    js: LOGREG_JS_POINTER_LABELS,
    py: LOGREG_PY_POINTER_LABELS,
  },
};
