import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  LINREG_PSEUDO,
  LINREG_PSEUDO_POINTER_HINTS,
  LINREG_PSEUDO_POINTER_LABELS,
} from "./linreg-pseudo";

import {
  LINREG_CPP,
  LINREG_CPP_POINTER_HINTS,
  LINREG_CPP_POINTER_LABELS,
} from "./linreg-cpp";

import {
  LINREG_JAVA,
  LINREG_JAVA_POINTER_HINTS,
  LINREG_JAVA_POINTER_LABELS,
} from "./linreg-java";

import {
  LINREG_TS,
  LINREG_TS_POINTER_HINTS,
  LINREG_TS_POINTER_LABELS,
} from "./linreg-ts";

import {
  LINREG_JS,
  LINREG_JS_POINTER_HINTS,
  LINREG_JS_POINTER_LABELS,
} from "./linreg-js";

import {
  LINREG_PY,
  LINREG_PY_POINTER_HINTS,
  LINREG_PY_POINTER_LABELS,
} from "./linreg-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(LINREG_PSEUDO);
const cppParsed = parseMarkerSpans(LINREG_CPP);
const javaParsed = parseMarkerSpans(LINREG_JAVA);
const tsParsed = parseMarkerSpans(LINREG_TS);
const jsParsed = parseMarkerSpans(LINREG_JS);
const pyParsed = parseMarkerSpans(LINREG_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const LINREG_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "linreg.pseudo", content: pseudoParsed.content },
    cpp: { file: "linreg.cpp", content: cppParsed.content },
    java: { file: "linreg.java", content: javaParsed.content },
    ts: { file: "linreg.ts", content: tsParsed.content },
    js: { file: "linreg.js", content: jsParsed.content },
    py: { file: "linreg.py", content: pyParsed.content },
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
    pseudo: LINREG_PSEUDO_POINTER_HINTS,
    cpp: LINREG_CPP_POINTER_HINTS,
    java: LINREG_JAVA_POINTER_HINTS,
    ts: LINREG_TS_POINTER_HINTS,
    js: LINREG_JS_POINTER_HINTS,
    py: LINREG_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: LINREG_PSEUDO_POINTER_LABELS,
    cpp: LINREG_CPP_POINTER_LABELS,
    java: LINREG_JAVA_POINTER_LABELS,
    ts: LINREG_TS_POINTER_LABELS,
    js: LINREG_JS_POINTER_LABELS,
    py: LINREG_PY_POINTER_LABELS,
  },
};
