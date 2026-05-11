'use client';

const SPECS = [
  { label: 'DIMENSIONS', value: '395 × 395 × 190', unit: 'mm' },
  { label: 'WEIGHT', value: '1180', unit: 'g' },
  { label: 'ROLE', value: 'COMPACT TACTICAL', unit: '' },
];

export function SpecLock() {
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="shell w-full grid grid-cols-12 gap-6">
        <div className="hidden md:block col-span-7" />
        <aside className="col-span-12 md:col-span-5 max-w-[400px] md:ml-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-6 bg-signal-blue/70" />
            <span className="font-mono text-micro uppercase tracking-widest text-text-muted">
              VERIFIED SPECIFICATIONS
            </span>
          </div>

          <dl className="space-y-5">
            {SPECS.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-micro uppercase tracking-widest text-text-muted">
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-h4 font-light text-text-primary tabular-nums">
                  {s.value}{' '}
                  {s.unit && <span className="text-text-muted text-h6">{s.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
