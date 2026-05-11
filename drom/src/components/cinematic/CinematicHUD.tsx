'use client';

import { useSceneState, PHASES } from '@/components/three/sceneState';

/**
 * Bare-bones HUD: a single tiny phase + scrub strip pinned bottom-center.
 * No crosshair, no telemetry chips, no scanline. Lets the drone breathe.
 */
export function CinematicHUD() {
  const progress = useSceneState((s) => s.progress);
  const phase = useSceneState((s) => s.phase);
  const phaseLabel = PHASES[phase]?.label ?? '';
  const pct = Math.round(progress * 100);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Phase strip — bottom center, minimal */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="font-mono text-micro uppercase tracking-widest text-text-muted tabular-nums">
          {String(phase + 1).padStart(2, '0')} / {String(PHASES.length).padStart(2, '0')}
        </span>
        <span className="relative h-px w-[180px] bg-border-blue/30">
          <span
            className="absolute inset-y-0 left-0 bg-signal-cyan"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="font-mono text-micro uppercase tracking-widest text-text-secondary">
          {phaseLabel}
        </span>
      </div>
    </div>
  );
}
