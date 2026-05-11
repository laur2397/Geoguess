'use client';

import { useSceneState, PHASES } from '@/components/three/sceneState';

export function CinematicHUD() {
  const progress = useSceneState((s) => s.progress);
  const phase = useSceneState((s) => s.phase);
  const phaseLabel = PHASES[phase]?.label ?? '';
  const pct = Math.round(progress * 100);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top-left corner chip */}
      <div className="absolute top-6 left-6 flex items-center gap-3 panel-deep px-3 py-2 hud-corner">
        <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
        <span className="micro text-text-secondary">LIVE / SIMULATED PRESENTATION</span>
      </div>

      {/* Top-right phase indicator */}
      <div className="absolute top-6 right-6 panel-deep px-3 py-2 hud-corner">
        <div className="flex items-center gap-3">
          <span className="micro text-text-muted">PHASE</span>
          <span className="font-mono text-label uppercase text-text-primary tabular-nums">
            {String(phase + 1).padStart(2, '0')} / {String(PHASES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mt-1 micro text-text-secondary">{phaseLabel}</div>
      </div>

      {/* Bottom-left telemetry stack */}
      <div className="absolute bottom-6 left-6 panel-deep px-3 py-2 hud-corner">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="micro text-text-muted">SIGNAL</span>
            <span className="micro text-text-secondary">LINK CHECK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="micro text-text-muted">DEVICE</span>
            <span className="micro text-text-secondary">DROM / 1180g</span>
          </div>
        </div>
      </div>

      {/* Bottom-right scrub bar */}
      <div className="absolute bottom-6 right-6 w-[260px] max-w-[40vw] panel-deep px-3 py-2 hud-corner">
        <div className="flex items-center justify-between">
          <span className="micro text-text-muted">PROFILE SCRUB</span>
          <span className="font-mono text-micro text-text-secondary tabular-nums">
            {String(pct).padStart(3, '0')}%
          </span>
        </div>
        <div className="relative mt-2 h-px bg-border-blue/40">
          <div
            className="absolute inset-y-0 left-0 bg-signal-cyan"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Subtle scanline */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal-blue/40 to-transparent animate-scanline"
        />
      </div>

      {/* Crosshair lines */}
      <div className="absolute inset-0">
        <div
          aria-hidden
          className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-blue to-transparent opacity-40"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-blue to-transparent opacity-30"
        />
      </div>
    </div>
  );
}
