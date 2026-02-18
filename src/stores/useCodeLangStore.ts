// src/stores/useCodeLangStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CODE_LANGS, type CodeLang } from "../types/algo-types";

type State = {
  lang: CodeLang;
  setLang: (lang: CodeLang) => void;
};

const isCodeLang = (v: unknown): v is CodeLang =>
  CODE_LANGS.includes(v as CodeLang);

export const useCodeLangStore = create<State>()(
  persist(
    (set) => ({
      lang: "java",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "tn-code-lang",
      migrate: (persisted) => {
        const p = persisted as any;
        const lang = isCodeLang(p?.state?.lang) ? p.state.lang : "java";
        return { ...p, state: { ...p.state, lang } };
      },
    }
  )
);
