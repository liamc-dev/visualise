import { create } from "zustand";
import { persist } from "zustand/middleware";

type PredictState = {
  predictEnabled: boolean;
  togglePredict: () => void;
  setPredictEnabled: (value: boolean) => void;
};

export const usePredictStore = create<PredictState>()(
  persist(
    (set) => ({
      predictEnabled: false,

      togglePredict: () =>
        set((state) => ({ predictEnabled: !state.predictEnabled })),

      setPredictEnabled: (value: boolean) =>
        set({ predictEnabled: value }),
    }),
    { name: "tn-predict" },
  ),
);
