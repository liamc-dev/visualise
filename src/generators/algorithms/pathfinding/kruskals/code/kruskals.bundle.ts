import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  KRUSKALS_PSEUDO,
  KRUSKALS_PSEUDO_POINTER_HINTS,
  KRUSKALS_PSEUDO_POINTER_LABELS,
} from "./kruskals-pseudo";

import {
  KRUSKALS_CPP,
  KRUSKALS_CPP_POINTER_HINTS,
  KRUSKALS_CPP_POINTER_LABELS,
} from "./kruskals-cpp";

import {
  KRUSKALS_JAVA,
  KRUSKALS_JAVA_POINTER_HINTS,
  KRUSKALS_JAVA_POINTER_LABELS,
} from "./kruskals-java";

import {
  KRUSKALS_TS,
  KRUSKALS_TS_POINTER_HINTS,
  KRUSKALS_TS_POINTER_LABELS,
} from "./kruskals-ts";

import {
  KRUSKALS_JS,
  KRUSKALS_JS_POINTER_HINTS,
  KRUSKALS_JS_POINTER_LABELS,
} from "./kruskals-js";

import {
  KRUSKALS_PY,
  KRUSKALS_PY_POINTER_HINTS,
  KRUSKALS_PY_POINTER_LABELS,
} from "./kruskals-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(KRUSKALS_PSEUDO);
const cppParsed = parseMarkerSpans(KRUSKALS_CPP);
const javaParsed = parseMarkerSpans(KRUSKALS_JAVA);
const tsParsed = parseMarkerSpans(KRUSKALS_TS);
const jsParsed = parseMarkerSpans(KRUSKALS_JS);
const pyParsed = parseMarkerSpans(KRUSKALS_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const KRUSKALS_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "kruskals.pseudo", content: pseudoParsed.content },
    cpp: { file: "kruskals.cpp", content: cppParsed.content },
    java: { file: "kruskals.java", content: javaParsed.content },
    ts: { file: "kruskals.ts", content: tsParsed.content },
    js: { file: "kruskals.js", content: jsParsed.content },
    py: { file: "kruskals.py", content: pyParsed.content },
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
      const minLine = Math.min(...spans.map((s) => s.line));
      const maxLine = Math.max(...spans.map((s) => s.line));
      lines = [minLine, maxLine];
    }

    return { file, lines, spans };
  },

  pointerHints: {
    pseudo: KRUSKALS_PSEUDO_POINTER_HINTS,
    cpp: KRUSKALS_CPP_POINTER_HINTS,
    java: KRUSKALS_JAVA_POINTER_HINTS,
    ts: KRUSKALS_TS_POINTER_HINTS,
    js: KRUSKALS_JS_POINTER_HINTS,
    py: KRUSKALS_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: KRUSKALS_PSEUDO_POINTER_LABELS,
    cpp: KRUSKALS_CPP_POINTER_LABELS,
    java: KRUSKALS_JAVA_POINTER_LABELS,
    ts: KRUSKALS_TS_POINTER_LABELS,
    js: KRUSKALS_JS_POINTER_LABELS,
    py: KRUSKALS_PY_POINTER_LABELS,
  },
};
