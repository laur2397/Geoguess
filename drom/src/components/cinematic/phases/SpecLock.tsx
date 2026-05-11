'use client';

const SPECS = [
  { label: 'DIMENSIONS', value: '395 × 395 × 190 mm' },
  { label: 'WEIGHT', value: '1180 g' },
  { label: 'APPLICATION', value: 'Defense and security operations' },
  { label: 'SYSTEM ROLE', value: 'Compact tactical aerial platform' },
  { label: 'OPERATIONAL FOCUS', value: 'Mobility, control and rapid integration' },
];

export function SpecLock() {
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="shell w-full grid grid-cols-12 gap-6">
        {/* Right-aligned spec panel; drone has shifted left in the scene */}
        <div className="hidden md:block col-span-6" />
        <aside className="col-span-12 md:col-span-6 panel hud-corner p-6 md:p-7 max-w-[480px] md:ml-auto">
          <div className="flex items-center justify-between mb-5">
            <span className="label">KEY SPECIFICATIONS</span>
            <span className="micro flex items-center gap-2 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
              VERIFIED
            </span>
          </div>

          <dl>
            {SPECS.map((s) => (
              <div key={s.label} className="stat-row">
                <dt className="label text-text-muted shrink-0">{s.label}</dt>
                <dd className="font-mono text-label text-text-primary text-right">{s.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 micro text-text-muted">
            ADDITIONAL VERIFIED SPECIFICATIONS AVAILABLE IN THE TECHNICAL BRIEF.
          </p>
        </aside>
      </div>
    </div>
  );
}
