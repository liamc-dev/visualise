// src/types/algo-types.ts

/** Grid cell index. */
export type Highlight = number[];

/** Code language options shown in the UI. */
export const CODE_LANGS = [
  "pseudo",
  "ts",
  "py",
  "js",
  "java",
  "cpp",
] as const;

export type CodeLang = (typeof CODE_LANGS)[number];

export const CODE_LANG_LABELS = {
  pseudo: "Pseudo",
  ts: "TypeScript",
  py: "Python",
  js: "JavaScript",
  java: "Java",
  cpp: "C++",
} as const satisfies Record<CodeLang, string>;

export const EDITOR_LANG_MAP = {
  java: "java",
  ts: "typescript",
  js: "javascript",
  cpp: "cpp",
  py: "python",
  pseudo: "plaintext",
} as const satisfies Record<CodeLang, string>;

export type StepMeta = Record<string, unknown>;

/** narration types */
export type NarrationMode = "explain" | "code" | "minimal";

export type NarrationCtx = {
  ptr: Record<string, number>;
  meta: Record<string, unknown>;
};

export type NarrationBundle = {
  defaultMode?: NarrationMode;
  resolve: (token: string, mode: NarrationMode, ctx: NarrationCtx) => string;
};

/** A loaded code source. */
export type CodeSource = {
  file: string;      // e.g. "quick-sort.pseudo"
  content: string;   // full text to render
  skeleton?: string;   // recall skeleton
};

/** A highlighted location inside a source. */
export type CodeRef = {
  file: string;              // file from CodeSource.file
  lines?: [number, number];  // inclusive, optional if no map for lang
  spans?: CodeSpan[];
};

export type CodeTokenRef = {
  token: string;
};

export type CodeSpan = {
  line: number;   // 1-based
  from: number;   // 0-based
  to: number;     // 0-based (exclusive)
};

export type MarkerParseResult = {
  content: string;                           // code with markers removed
  spansByToken: Record<string, CodeSpan[]>;  // token -> spans in content
};

/** Per-algorithm code bundle: sources + token maps + resolver. */
export type CodeBundle = {
  sources: Partial<Record<CodeLang, CodeSource>>;
  spanMaps?: Partial<Record<CodeLang, Record<string, CodeSpan[]>>>;
  resolve: (lang: CodeLang, token: string) => CodeRef;
  pointerHints?: Partial<Record<CodeLang, Record<string, string[]>>>;
  pointerLabels?: Partial<Record<CodeLang, Record<string, string>>>;
};



