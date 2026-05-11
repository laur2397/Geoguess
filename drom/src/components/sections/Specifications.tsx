import { SectionHeader } from './SectionHeader';

const SPECS = [
  { label: 'DIMENSIONS', value: '395 × 395 × 190 mm', note: 'Drone body envelope' },
  { label: 'WEIGHT', value: '1180 g', note: 'Platform mass' },
  { label: 'APPLICATION', value: 'Defense and security operations', note: 'Intended use context' },
  { label: 'SYSTEM ROLE', value: 'Compact tactical aerial platform', note: 'Primary product role' },
  { label: 'OPERATIONAL FOCUS', value: 'Mobility, control and rapid integration', note: 'Design priorities' },
];

const SUBSYSTEMS = [
  { label: 'PLATFORM', value: 'Drone unit' },
  { label: 'OPERATOR INPUT', value: 'Handheld controller' },
  { label: 'VISUAL FEEDBACK', value: 'FPV goggles' },
];

const COMPONENT_DIMS = [
  { label: 'CONTROLLER', value: '160 × 195 × 75 mm' },
  { label: 'FPV GOGGLES', value: '195 × 150 × 95 mm' },
];

export function Specifications() {
  return (
    <section id="specifications" className="relative py-28 md:py-36 bg-ink-900/60">
      <div className="absolute inset-0 grid-overlay-fine opacity-[0.10] pointer-events-none" aria-hidden />
      <div className="shell">
        <SectionHeader
          index="04 / SPECIFICATIONS"
          eyebrow="DIMENSIONAL DATA"
          title={
            <>
              Verified technical
              <span className="block text-text-secondary">specifications.</span>
            </>
          }
          intro={
            <>
              Only validated values are listed. Performance data, communications behavior,
              autonomy and environmental ratings are intentionally omitted and may be shared
              under the technical brief.
            </>
          }
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* Primary spec sheet */}
          <div className="lg:col-span-7 panel hud-corner p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="label">KEY SPECIFICATIONS · PLATFORM</span>
              <span className="micro flex items-center gap-2 text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
                VERIFIED
              </span>
            </div>
            <dl className="divide-y divide-border-subtle">
              {SPECS.map((s) => (
                <div key={s.label} className="grid grid-cols-12 items-baseline gap-4 py-4">
                  <dt className="col-span-4 label text-text-muted">{s.label}</dt>
                  <dd className="col-span-5 font-mono text-label text-text-primary">{s.value}</dd>
                  <dd className="col-span-3 micro text-text-muted text-right hidden md:block">
                    {s.note}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 micro text-text-muted">
              ADDITIONAL VERIFIED TECHNICAL SPECIFICATIONS MAY BE PROVIDED IN THE TECHNICAL BRIEF.
            </p>
          </div>

          {/* Side: subsystems + component dims */}
          <div className="lg:col-span-5 grid gap-6">
            <div className="panel hud-corner p-6">
              <span className="label">SYSTEM COMPOSITION</span>
              <ul className="mt-4 divide-y divide-border-subtle">
                {SUBSYSTEMS.map((s) => (
                  <li key={s.label} className="stat-row">
                    <span className="micro text-text-muted">{s.label}</span>
                    <span className="font-mono text-label text-text-primary">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel hud-corner p-6">
              <span className="label">COMPONENT DIMENSIONS</span>
              <ul className="mt-4 divide-y divide-border-subtle">
                {COMPONENT_DIMS.map((s) => (
                  <li key={s.label} className="stat-row">
                    <span className="micro text-text-muted">{s.label}</span>
                    <span className="font-mono text-label text-text-primary">{s.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 micro text-text-muted">
                APPROXIMATE COMPONENT FOOTPRINTS, FROM PRODUCT REFERENCE DOCUMENTATION.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
