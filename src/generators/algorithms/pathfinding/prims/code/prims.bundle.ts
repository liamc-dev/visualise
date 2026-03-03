import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  PRIMS_PSEUDO,
  PRIMS_PSEUDO_POINTER_HINTS,
  PRIMS_PSEUDO_POINTER_LABELS,
} from "./prims-pseudo";

import {
  PRIMS_CPP,
  PRIMS_CPP_POINTER_HINTS,
  PRIMS_CPP_POINTER_LABELS,
} from "./prims-cpp";

import {
  PRIMS_JAVA,
  PRIMS_JAVA_POINTER_HINTS,
  PRIMS_JAVA_POINTER_LABELS,
} from "./prims-java";

import {
  PRIMS_TS,
  PRIMS_TS_POINTER_HINTS,
  PRIMS_TS_POINTER_LABELS,
} from "./prims-ts";

import {
  PRIMS_JS,
  PRIMS_JS_POINTER_HINTS,
  PRIMS_JS_POINTER_LABELS,
} from "./prims-js";

import {
  PRIMS_PY,
  PRIMS_PY_POINTER_HINTS,
  PRIMS_PY_POINTER_LABELS,
} from "./prims-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(PRIMS_PSEUDO);
const cppParsed = parseMarkerSpans(PRIMS_CPP);
const javaParsed = parseMarkerSpans(PRIMS_JAVA);
const tsParsed = parseMarkerSpans(PRIMS_TS);
const jsParsed = parseMarkerSpans(PRIMS_JS);
const pyParsed = parseMarkerSpans(PRIMS_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const PRIMS_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "prims.pseudo", content: pseudoParsed.content },
    cpp: { file: "prims.cpp", content: cppParsed.content },
    java: { file: "prims.java", content: javaParsed.content },
    ts: { file: "prims.ts", content: tsParsed.content },
    js: { file: "prims.js", content: jsParsed.content },
    py: { file: "prims.py", content: pyParsed.content },
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
    pseudo: PRIMS_PSEUDO_POINTER_HINTS,
    cpp: PRIMS_CPP_POINTER_HINTS,
    java: PRIMS_JAVA_POINTER_HINTS,
    ts: PRIMS_TS_POINTER_HINTS,
    js: PRIMS_JS_POINTER_HINTS,
    py: PRIMS_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: PRIMS_PSEUDO_POINTER_LABELS,
    cpp: PRIMS_CPP_POINTER_LABELS,
    java: PRIMS_JAVA_POINTER_LABELS,
    ts: PRIMS_TS_POINTER_LABELS,
    js: PRIMS_JS_POINTER_LABELS,
    py: PRIMS_PY_POINTER_LABELS,
  },
};
