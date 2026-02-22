import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  DFS_PSEUDO,
  DFS_PSEUDO_POINTER_HINTS,
  DFS_PSEUDO_POINTER_LABELS,
} from "./dfs-pseudo";

import {
  DFS_CPP,
  DFS_CPP_POINTER_HINTS,
  DFS_CPP_POINTER_LABELS,
} from "./dfs-cpp";

import {
  DFS_JAVA,
  DFS_JAVA_POINTER_HINTS,
  DFS_JAVA_POINTER_LABELS,
} from "./dfs-java";

import {
  DFS_TS,
  DFS_TS_POINTER_HINTS,
  DFS_TS_POINTER_LABELS,
} from "./dfs-ts";

import {
  DFS_JS,
  DFS_JS_POINTER_HINTS,
  DFS_JS_POINTER_LABELS,
} from "./dfs-js";

import {
  DFS_PY,
  DFS_PY_POINTER_HINTS,
  DFS_PY_POINTER_LABELS,
} from "./dfs-py";

/* Parse marker spans */

const pseudoParsed = parseMarkerSpans(DFS_PSEUDO);
const cppParsed = parseMarkerSpans(DFS_CPP);
const javaParsed = parseMarkerSpans(DFS_JAVA);
const tsParsed = parseMarkerSpans(DFS_TS);
const jsParsed = parseMarkerSpans(DFS_JS);
const pyParsed = parseMarkerSpans(DFS_PY);

/* Bundle */

export const DFS_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "dfs.pseudo", content: pseudoParsed.content },
    cpp: { file: "dfs.cpp", content: cppParsed.content },
    java: { file: "dfs.java", content: javaParsed.content },
    ts: { file: "dfs.ts", content: tsParsed.content },
    js: { file: "dfs.js", content: jsParsed.content },
    py: { file: "dfs.py", content: pyParsed.content },
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
    pseudo: DFS_PSEUDO_POINTER_HINTS,
    cpp: DFS_CPP_POINTER_HINTS,
    java: DFS_JAVA_POINTER_HINTS,
    ts: DFS_TS_POINTER_HINTS,
    js: DFS_JS_POINTER_HINTS,
    py: DFS_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: DFS_PSEUDO_POINTER_LABELS,
    cpp: DFS_CPP_POINTER_LABELS,
    java: DFS_JAVA_POINTER_LABELS,
    ts: DFS_TS_POINTER_LABELS,
    js: DFS_JS_POINTER_LABELS,
    py: DFS_PY_POINTER_LABELS,
  },
};
