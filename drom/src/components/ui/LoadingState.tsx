'use client';

interface LoadingStateProps {
  progress?: number; // 0..1
  label?: string;
}

export function LoadingState({ progress = 0, label = 'LOADING PLATFORM PROFILE' }: LoadingStateProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink-950 text-text-secondary"
    >
      <div className="absolute inset-0 grid-overlay-fine opacity-40" aria-hidden />
      <div className="relative w-[260px] max-w-[60vw]">
        <div className="flex items-center justify-between mb-3">
          <span className="micro text-text-muted">{label}</span>
          <span className="font-mono text-micro text-text-secondary tabular-nums">
            {String(pct).padStart(3, '0')}%
          </span>
        </div>
        <div className="relative h-px bg-border-blue/40 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-signal-blue"
            style={{ width: `${pct}%`, transition: 'width 220ms ease-out' }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
          <span className="font-mono text-micro text-text-muted">SYSTEM INITIALIZED · STANDBY</span>
        </div>
      </div>
    </div>
  );
}
