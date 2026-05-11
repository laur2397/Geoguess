'use client';

import { create } from 'zustand';

interface SceneState {
  /** Smoothed scroll progress through the cinematic, 0..1 */
  progress: number;
  /** Active phase index 0..7 */
  phase: number;
  /** True after R3F first frame */
  ready: boolean;
  setProgress: (n: number) => void;
  setPhase: (n: number) => void;
  setReady: (v: boolean) => void;
}

export const useSceneState = create<SceneState>((set) => ({
  progress: 0,
  phase: 0,
  ready: false,
  setProgress: (n) => set({ progress: n }),
  setPhase: (n) => set({ phase: n }),
  setReady: (v) => set({ ready: v }),
}));

/** Discrete phase keypoints along the cinematic */
export const PHASES = [
  { key: 'wake', t: 0.0, label: 'SYSTEM INITIALIZED' },
  { key: 'reveal', t: 0.14, label: 'PLATFORM PROFILE' },
  { key: 'inspect', t: 0.30, label: 'INSPECTION ROTATION' },
  { key: 'spec', t: 0.50, label: 'SPECIFICATION LOCK' },
  { key: 'features', t: 0.66, label: 'FEATURE MAPPING' },
  { key: 'command', t: 0.80, label: 'COMMAND INTERFACE' },
  { key: 'engineering', t: 0.92, label: 'ENGINEERING FOCUS' },
  { key: 'lockup', t: 1.0, label: 'MISSION READY' },
] as const;

export type PhaseKey = (typeof PHASES)[number]['key'];
