import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type DraftKey = string;

type CodeDraftState = {
  drafts: Record<DraftKey, string>;
  getDraft: (key: DraftKey) => string;
  setDraft: (key: DraftKey, value: string) => void;
  clearDraft: (key: DraftKey) => void;
};

export const useCodeDraftStore = create<CodeDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      getDraft: (key) => get().drafts[key] ?? "",

      setDraft: (key, value) =>
        set((s) => ({
          drafts: {
            ...s.drafts,
            [key]: value ?? "",
          },
        })),

      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[key];
          return { drafts: next };
        }),
    }),
    {
      name: "code-drafts", // storage key
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
