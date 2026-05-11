'use client';

import { useEffect, useState } from 'react';

export type DeviceCapability = 'high' | 'medium' | 'low' | 'unsupported';

interface CapabilityState {
  tier: DeviceCapability;
  webgl: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
  dpr: number;
}

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function useDeviceCapability(): CapabilityState {
  const [state, setState] = useState<CapabilityState>({
    tier: 'high',
    webgl: true,
    reducedMotion: false,
    isMobile: false,
    dpr: 1,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const webgl = detectWebGL();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    let tier: DeviceCapability = 'high';
    if (!webgl) tier = 'unsupported';
    else if (reducedMotion) tier = 'low';
    else if (isMobile || cores < 4 || memory < 4) tier = 'medium';
    if (cores <= 2 || memory <= 2) tier = 'low';

    setState({ tier, webgl, reducedMotion, isMobile, dpr });
  }, []);

  return state;
}
