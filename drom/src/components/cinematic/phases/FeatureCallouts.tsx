'use client';

const FEATURES = [
  {
    label: 'COMPACT FRAME',
    body: 'Optimized physical footprint for agile deployment and transport.',
    style: 'top-[18%] left-[8%]',
    line: 'right-0 top-1/2',
  },
  {
    label: 'PRECISION CONTROL',
    body: 'Interface logic focused on stable handling and responsive operator input.',
    style: 'top-[18%] right-[8%]',
    line: 'left-0 top-1/2',
  },
  {
    label: 'RAPID INTEGRATION',
    body: 'Structured for adoption into operational workflows with minimal visual complexity.',
    style: 'bottom-[20%] left-[8%]',
    line: 'right-0 top-1/2',
  },
  {
    label: 'OPERATIONAL MOBILITY',
    body: 'Compact platform geometry designed around movement, portability and field readiness.',
    style: 'bottom-[20%] right-[8%]',
    line: 'left-0 top-1/2',
  },
];

export function FeatureCallouts() {
  return (
    <div className="absolute inset-0 hidden md:block">
      {FEATURES.map((f) => (
        <div key={f.label} className={`absolute w-[260px] ${f.style}`}>
          <div className="panel hud-corner p-4">
            <span className="label text-text-muted">{f.label}</span>
            <p className="mt-2 text-body text-text-secondary">{f.body}</p>
          </div>
          {/* Connector line toward center */}
          <span
            aria-hidden
            className={`absolute h-px w-12 bg-gradient-to-r from-signal-blue/60 to-transparent ${f.line}`}
          />
        </div>
      ))}

      {/* Center anchor pulse */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-signal-cyan/80 shadow-[0_0_24px_rgba(0,174,239,0.65)]"
      />

      {/* Mobile fallback */}
      <div className="md:hidden absolute bottom-8 left-0 right-0 px-6">
        <div className="panel p-5">
          <span className="label">FEATURE MAPPING</span>
          <ul className="mt-3 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="micro text-text-muted block">{f.label}</span>
                <span className="text-body text-text-secondary">{f.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
