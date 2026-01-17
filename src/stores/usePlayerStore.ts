// src/stores/usePlayerStore.ts
import { create } from "zustand";

export type PlayerState = {
  // raw state
  stepsLength: number;
  currentStep: number;
  isPlaying: boolean;
  paused: boolean;
  speedMs: number;

  // ----- derived state (functions instead of getters!)
  atFirstStep: () => boolean;
  atLastStep: () => boolean;
  progress: () => number;      // 0...1
  ledCount: () => number;      // usually 10
  activeLeds: () => number;    // computed from progress

  // ----- actions
  setStepsLength: (len: number) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  setSpeed: (ms: number) => void;
  reset: () => void;
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  
  stepsLength: 0,
  currentStep: 0,
  isPlaying: false,
  paused: false,
  speedMs: 800,

  
  atFirstStep: () => get().currentStep <= 0,

  atLastStep: () =>
    get().currentStep >= get().stepsLength - 1,

  progress: () => {
    const { currentStep, stepsLength } = get();
    if (stepsLength <= 1) return 0;
    return (currentStep + 1) / stepsLength;
  },

  ledCount: () => 10,

  activeLeds: () =>
    Math.round(get().progress() * get().ledCount()),

  
  setStepsLength: (stepsLength) => set({ stepsLength }),

  setStep: (step) => {
    const max = get().stepsLength - 1;
    const clamped = Math.max(0, Math.min(step, max));
    set({ currentStep: clamped });
  },

  nextStep: () => {
    const { currentStep, stepsLength } = get();
    if (currentStep < stepsLength - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  setPlaying: (isPlaying) => {
    const { currentStep, stepsLength } = get();

    // If user hits play at the end → restart
    if (
      isPlaying &&
      stepsLength > 0 &&
      currentStep >= stepsLength - 1
    ) {
      set({
        currentStep: 0,
        isPlaying: true,
        paused: false,
      });
      return;
    }

      set({ isPlaying });
  },

  setPaused: (paused) => set({ paused }),

  setSpeed: (speedMs) => set({ speedMs }),

  reset: () => {
    set({
      currentStep: 0,
      isPlaying: false,
      paused: false,
    });
  },
}));
