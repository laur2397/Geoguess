'use client';

import { RadarGraphic } from '@/components/ui/RadarGraphic';

const STATUS = [
  { label: 'SYSTEM READINESS', value: 'ONLINE', tone: 'good' as const },
  { label: 'DEVICE PROFILE', value: 'DROM PLATFORM', tone: 'neutral' as const },
  { label: 'MISSION STATUS', value: 'STANDBY', tone: 'neutral' as const },
  { label: 'SIGNAL STATUS', value: 'LINK CHECK', tone: 'attention' as const },
  { label: 'CONTROL MODE', value: 'OPERATOR REVIEW', tone: 'neutral' as const },
  { label: 'TELEMETRY', value: 'SIMULATED UI CONCEPT', tone: 'muted' as const },
];

const TONE: Record<'good' | 'neutral' | 'attention' | 'muted', string> = {
  good: 'text-signal-cyan',
  neutral: 'text-text-primary',
  attention: 'text-signal-amber',
  muted: 'text-text-muted',
};

export function CommandLayer() {
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="shell w-full grid grid-cols-12 gap-4">
        {/* Left dashboard column */}
        <div className="col-span-12 lg:col-span-4 panel hud-corner p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="label">DEVICE STATUS</span>
            <span className="micro text-text-muted">CONCEPT</span>
          </div>
          <ul className="divide-y divide-border-subtle">
            {STATUS.map((s) => (
              <li key={s.label} className="flex items-center justify-between py-2.5">
                <span className="micro text-text-muted">{s.label}</span>
                <span className={`font-mono text-label uppercase ${TONE[s.tone]}`}>{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Center radar / map grid */}
        <div className="hidden lg:flex col-span-4 items-center justify-center">
          <div className="panel hud-corner p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="label">MAP GRID</span>
              <span className="micro text-text-muted">N · 47.06 / E · 21.93</span>
            </div>
            <RadarGraphic size={220} />
            <div className="mt-3 flex items-center justify-between">
              <span className="micro text-text-muted">RANGE</span>
              <span className="font-mono text-micro text-text-secondary">CONCEPTUAL</span>
            </div>
          </div>
        </div>

        {/* Right operator panel */}
        <div className="col-span-12 lg:col-span-4 panel hud-corner p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="label">OPERATOR INTERFACE</span>
            <span className="micro flex items-center gap-2 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
              ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            <Row label="ACCESS" value="CONTROLLED" />
            <Row label="PROFILE" value="OPERATOR REVIEW" />
            <Row label="WORKFLOW" value="STANDARD" />
            <Row label="NOTES" value="CLEAR" />
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle">
            <p className="micro text-text-muted">
              A STRUCTURED COMMAND INTERFACE CONCEPT DESIGNED TO SUPPORT SITUATIONAL AWARENESS,
              DEVICE MONITORING AND OPERATIONAL CLARITY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="micro text-text-muted">{label}</span>
      <span className="font-mono text-label text-text-primary">{value}</span>
    </div>
  );
}
