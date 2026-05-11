'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSceneState, PHASES } from './sceneState';
import { useDeviceCapability } from '@/lib/useDeviceCapability';
import { LoadingState } from '@/components/ui/LoadingState';
import { CinematicHUD } from '@/components/cinematic/CinematicHUD';
import { CinematicOverlay } from '@/components/cinematic/CinematicOverlay';
import { StaticDronePoster } from '@/components/three/StaticDronePoster';

const DroneScene = dynamic(
  () => import('./DroneScene').then((m) => m.DroneScene),
  { ssr: false, loading: () => <LoadingState progress={0.4} /> },
);

/**
 * Pins a 3D scene and maps its scroll-bound `progress` 0..1 to camera/drone state.
 * The pinned section is ~7 viewport heights tall — gives the impression of a long
 * cinematic frame sequence while only running real-time rendering.
 */
export function CinematicStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const setProgress = useSceneState((s) => s.setProgress);
  const setPhase = useSceneState((s) => s.setPhase);
  const ready = useSceneState((s) => s.ready);
  const cap = useDeviceCapability();
  const [bootProgress, setBootProgress] = useState(0);

  // Soft boot animation while WebGL warms up
  useEffect(() => {
    if (ready) {
      setBootProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const eased = Math.min(0.92, elapsed / 1800);
      setBootProgress(eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  useEffect(() => {
    if (cap.reducedMotion) return;
    if (!stageRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const scrubVal = cap.tier === 'low' ? 0.6 : 0.8;
      const stage = stageRef.current!;
      const sticky = stickyRef.current!;

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        pin: sticky,
        pinSpacing: false,
        scrub: scrubVal,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          // determine phase
          let phase = 0;
          for (let i = 0; i < PHASES.length; i++) {
            if (p >= PHASES[i].t) phase = i;
          }
          setPhase(phase);
        },
      });

      return () => trigger.kill();
    }, stageRef);

    return () => ctx.revert();
  }, [cap.reducedMotion, cap.tier, setProgress, setPhase]);

  // For reduced motion, render a static poster + use anchor scroll as phase driver
  const reduced = cap.reducedMotion;

  return (
    <div ref={stageRef} className="relative" style={{ height: reduced ? 'auto' : '700vh' }}>
      <div
        ref={stickyRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Background grids */}
        <div className="absolute inset-0 grid-overlay opacity-[0.18]" aria-hidden />
        <div
          className="absolute inset-0 bg-radial-fade pointer-events-none"
          aria-hidden
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        {/* WebGL scene OR static poster */}
        <div className="absolute inset-0">
          {cap.webgl && !reduced ? (
            <DroneScene className="absolute inset-0 h-full w-full" />
          ) : (
            <StaticDronePoster />
          )}
          {!ready && cap.webgl && !reduced && <LoadingState progress={bootProgress} />}
        </div>

        {/* HUD overlay (telemetry corners, scan line, phase marker) */}
        <CinematicHUD />

        {/* Phase-dependent text overlay (hero copy, spec panel, callouts, etc.) */}
        <CinematicOverlay />
      </div>
    </div>
  );
}
