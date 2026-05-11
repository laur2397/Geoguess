'use client';

export function HeroCopy() {
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="shell w-full">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-signal-blue/70" />
            <span className="eyebrow">COMPACT AERIAL PLATFORM / DEFENSE &amp; SECURITY</span>
          </div>
          <h1 className="mt-6 font-display text-h1 md:text-display font-semibold leading-[0.96] text-text-primary">
            DROM
            <span className="block text-h3 md:text-h2 font-light text-text-secondary mt-3 max-w-[18ch]">
              Advanced Aerial System for Defense Applications
            </span>
          </h1>
          <p className="mt-7 max-w-prose text-lead text-text-secondary">
            A compact aerial platform engineered for mobility, precision control and rapid
            tactical integration in demanding operational environments.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 pointer-events-auto">
            <a href="#inspection" className="btn-primary">
              Explore Platform
            </a>
            <a href="#technical-brief" className="btn-ghost">
              Request Technical Brief
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md pointer-events-auto">
            <Stat label="DIMENSIONS" value="395 × 395 × 190" unit="mm" />
            <Stat label="WEIGHT" value="1180" unit="g" />
            <Stat label="ROLE" value="COMPACT" unit="TACTICAL" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <span className="micro text-text-muted block">{label}</span>
      <span className="mt-1 block font-mono text-label text-text-primary tabular-nums">
        {value}
      </span>
      <span className="micro text-text-muted">{unit}</span>
    </div>
  );
}
