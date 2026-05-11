'use client';

import { RadarGraphic } from '@/components/ui/RadarGraphic';

/**
 * Phase 7 — pulled-back wide. Drone is small and drifts upper-right.
 * Command interface lives center-left as one tight panel, not a full grid.
 */
export function CommandLayer() {
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="shell w-full grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <div className="panel hud-corner p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="label">COMMAND LAYER</span>
              <span className="micro text-text-muted">CONCEPT</span>
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Row label="STATUS" value="ONLINE" tone="cyan" />
              <Row label="SIGNAL" value="LINK" />
              <Row label="MISSION" value="STANDBY" />
              <Row label="CONTROL" value="REVIEW" />
            </ul>
            <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
              <span className="micro text-text-muted">MAP GRID</span>
              <RadarGraphic size={64} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'cyan' }) {
  return (
    <li>
      <span className="micro text-text-muted block">{label}</span>
      <span
        className={`font-mono text-label uppercase ${
          tone === 'cyan' ? 'text-signal-cyan' : 'text-text-primary'
        }`}
      >
        {value}
      </span>
    </li>
  );
}
