import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  BINARY_SEARCH_PSEUDO,
  BINARY_SEARCH_PSEUDO_POINTER_HINTS,
  BINARY_SEARCH_PSEUDO_POINTER_LABELS,
} from "./binary-search-pseudo";

import {
  BINARY_SEARCH_CPP,
  BINARY_SEARCH_CPP_POINTER_HINTS,
  BINARY_SEARCH_CPP_POINTER_LABELS,
} from "./binary-search-cpp";

import {
  BINARY_SEARCH_JAVA,
  BINARY_SEARCH_JAVA_POINTER_HINTS,
  BINARY_SEARCH_JAVA_POINTER_LABELS,
} from "./binary-search-java";

import {
  BINARY_SEARCH_TS,
  BINARY_SEARCH_TS_POINTER_HINTS,
  BINARY_SEARCH_TS_POINTER_LABELS,
} from "./binary-search-ts";

import {
  BINARY_SEARCH_JS,
  BINARY_SEARCH_JS_POINTER_HINTS,
  BINARY_SEARCH_JS_POINTER_LABELS,
} from "./binary-search-js";

import {
  BINARY_SEARCH_PY,
  BINARY_SEARCH_PY_POINTER_HINTS,
  BINARY_SEARCH_PY_POINTER_LABELS,
} from "./binary-search-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(BINARY_SEARCH_PSEUDO);
const cppParsed = parseMarkerSpans(BINARY_SEARCH_CPP);
const javaParsed = parseMarkerSpans(BINARY_SEARCH_JAVA);
const tsParsed = parseMarkerSpans(BINARY_SEARCH_TS);
const jsParsed = parseMarkerSpans(BINARY_SEARCH_JS);
const pyParsed = parseMarkerSpans(BINARY_SEARCH_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const BINARY_SEARCH_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "binary-search.pseudo", content: pseudoParsed.content },
    cpp: { file: "binary-search.cpp", content: cppParsed.content },
    java: { file: "binary-search.java", content: javaParsed.content },
    ts: { file: "binary-search.ts", content: tsParsed.content },
    js: { file: "binary-search.js", content: jsParsed.content },
    py: { file: "binary-search.py", content: pyParsed.content },
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
    pseudo: BINARY_SEARCH_PSEUDO_POINTER_HINTS,
    cpp: BINARY_SEARCH_CPP_POINTER_HINTS,
    java: BINARY_SEARCH_JAVA_POINTER_HINTS,
    ts: BINARY_SEARCH_TS_POINTER_HINTS,
    js: BINARY_SEARCH_JS_POINTER_HINTS,
    py: BINARY_SEARCH_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: BINARY_SEARCH_PSEUDO_POINTER_LABELS,
    cpp: BINARY_SEARCH_CPP_POINTER_LABELS,
    java: BINARY_SEARCH_JAVA_POINTER_LABELS,
    ts: BINARY_SEARCH_TS_POINTER_LABELS,
    js: BINARY_SEARCH_JS_POINTER_LABELS,
    py: BINARY_SEARCH_PY_POINTER_LABELS,
  },
};
