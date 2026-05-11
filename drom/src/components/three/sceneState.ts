'use client';

import { create } from 'zustand';

interface SceneState {
  progress: number;
  phase: number;
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

/**
 * 8 phases keyed to scroll progress. The label is shown by the bottom HUD strip.
 * Phase boundaries match the choreography keyframes in DroneScene.tsx.
 */
export const PHASES = [
  { key: 'wake', t: 0.0, label: 'WAKE' },
  { key: 'ignition', t: 0.10, label: 'IGNITION' },
  { key: 'orbit', t: 0.22, label: 'ORBIT · 720°' },
  { key: 'macro', t: 0.45, label: 'MACRO' },
  { key: 'spec', t: 0.55, label: 'SPECIFICATION LOCK' },
  { key: 'features', t: 0.66, label: 'FEATURE STUDY' },
  { key: 'command', t: 0.78, label: 'COMMAND LAYER' },
  { key: 'lockup', t: 0.90, label: 'MISSION READY' },
] as const;

export type PhaseKey = (typeof PHASES)[number]['key'];
