'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { useReducedMotion } from '@/lib/useReducedMotion';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothWheel: true,
      lerp: 0.1,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
