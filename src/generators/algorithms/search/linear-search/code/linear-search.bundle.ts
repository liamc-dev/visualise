import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  LINEAR_SEARCH_PSEUDO,
  LINEAR_SEARCH_PSEUDO_POINTER_HINTS,
  LINEAR_SEARCH_PSEUDO_POINTER_LABELS,
} from "./linear-search-pseudo";

import {
  LINEAR_SEARCH_CPP,
  LINEAR_SEARCH_CPP_POINTER_HINTS,
  LINEAR_SEARCH_CPP_POINTER_LABELS,
} from "./linear-search-cpp";

import {
  LINEAR_SEARCH_JAVA,
  LINEAR_SEARCH_JAVA_POINTER_HINTS,
  LINEAR_SEARCH_JAVA_POINTER_LABELS,
} from "./linear-search-java";

import {
  LINEAR_SEARCH_TS,
  LINEAR_SEARCH_TS_POINTER_HINTS,
  LINEAR_SEARCH_TS_POINTER_LABELS,
} from "./linear-search-ts";

import {
  LINEAR_SEARCH_JS,
  LINEAR_SEARCH_JS_POINTER_HINTS,
  LINEAR_SEARCH_JS_POINTER_LABELS,
} from "./linear-search-js";

import {
  LINEAR_SEARCH_PY,
  LINEAR_SEARCH_PY_POINTER_HINTS,
  LINEAR_SEARCH_PY_POINTER_LABELS,
} from "./linear-search-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(LINEAR_SEARCH_PSEUDO);
const cppParsed = parseMarkerSpans(LINEAR_SEARCH_CPP);
const javaParsed = parseMarkerSpans(LINEAR_SEARCH_JAVA);
const tsParsed = parseMarkerSpans(LINEAR_SEARCH_TS);
const jsParsed = parseMarkerSpans(LINEAR_SEARCH_JS);
const pyParsed = parseMarkerSpans(LINEAR_SEARCH_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const LINEAR_SEARCH_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "linear-search.pseudo", content: pseudoParsed.content },
    cpp: { file: "linear-search.cpp", content: cppParsed.content },
    java: { file: "linear-search.java", content: javaParsed.content },
    ts: { file: "linear-search.ts", content: tsParsed.content },
    js: { file: "linear-search.js", content: jsParsed.content },
    py: { file: "linear-search.py", content: pyParsed.content },
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
    pseudo: LINEAR_SEARCH_PSEUDO_POINTER_HINTS,
    cpp: LINEAR_SEARCH_CPP_POINTER_HINTS,
    java: LINEAR_SEARCH_JAVA_POINTER_HINTS,
    ts: LINEAR_SEARCH_TS_POINTER_HINTS,
    js: LINEAR_SEARCH_JS_POINTER_HINTS,
    py: LINEAR_SEARCH_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: LINEAR_SEARCH_PSEUDO_POINTER_LABELS,
    cpp: LINEAR_SEARCH_CPP_POINTER_LABELS,
    java: LINEAR_SEARCH_JAVA_POINTER_LABELS,
    ts: LINEAR_SEARCH_TS_POINTER_LABELS,
    js: LINEAR_SEARCH_JS_POINTER_LABELS,
    py: LINEAR_SEARCH_PY_POINTER_LABELS,
  },
};
