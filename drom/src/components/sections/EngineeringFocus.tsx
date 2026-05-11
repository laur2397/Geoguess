import { SectionHeader } from './SectionHeader';

const BLOCKS = [
  {
    code: 'EF-01',
    title: 'Mechanical Design',
    body: 'Compact geometry, rigid structure and modular component layout.',
    diagram: (
      <svg viewBox="0 0 200 120" className="h-full w-full text-signal-blue/60" aria-hidden>
        <rect x="20" y="40" width="160" height="40" fill="none" stroke="currentColor" />
        <rect x="40" y="50" width="120" height="20" fill="none" stroke="currentColor" opacity="0.5" />
        <line x1="20" y1="20" x2="180" y2="20" stroke="currentColor" opacity="0.4" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" opacity="0.4" />
        <line x1="20" y1="20" x2="20" y2="100" stroke="currentColor" opacity="0.4" />
        <line x1="180" y1="20" x2="180" y2="100" stroke="currentColor" opacity="0.4" />
        <text x="20" y="14" fontFamily="ui-monospace" fontSize="6" fill="currentColor" letterSpacing="1">395 mm</text>
        <text x="186" y="64" fontFamily="ui-monospace" fontSize="6" fill="currentColor" letterSpacing="1" transform="rotate(90 186 64)">190 mm</text>
      </svg>
    ),
  },
  {
    code: 'EF-02',
    title: 'Control Architecture',
    body: 'Interface logic focused on responsiveness, operator clarity and consistent handling.',
    diagram: (
      <svg viewBox="0 0 200 120" className="h-full w-full text-signal-blue/60" aria-hidden>
        <circle cx="100" cy="60" r="36" fill="none" stroke="currentColor" />
        <circle cx="100" cy="60" r="20" fill="none" stroke="currentColor" opacity="0.5" />
        <line x1="100" y1="10" x2="100" y2="40" stroke="currentColor" />
        <line x1="100" y1="80" x2="100" y2="110" stroke="currentColor" />
        <line x1="20" y1="60" x2="64" y2="60" stroke="currentColor" />
        <line x1="136" y1="60" x2="180" y2="60" stroke="currentColor" />
        <circle cx="100" cy="60" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    code: 'EF-03',
    title: 'Deployment Readiness',
    body: 'Product structure designed for fast transport, setup and field-level integration.',
    diagram: (
      <svg viewBox="0 0 200 120" className="h-full w-full text-signal-blue/60" aria-hidden>
        <path d="M20 100 L100 30 L180 100 Z" fill="none" stroke="currentColor" />
        <line x1="40" y1="100" x2="160" y2="100" stroke="currentColor" opacity="0.5" />
        <line x1="100" y1="30" x2="100" y2="100" stroke="currentColor" opacity="0.4" />
        <circle cx="100" cy="30" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    code: 'EF-04',
    title: 'System Security',
    body: 'Access-controlled operational logic and secure workflow-oriented design.',
    diagram: (
      <svg viewBox="0 0 200 120" className="h-full w-full text-signal-blue/60" aria-hidden>
        <path d="M100 20 L160 40 V70 C160 90 130 105 100 110 C70 105 40 90 40 70 V40 Z" fill="none" stroke="currentColor" />
        <path d="M82 65 L96 78 L120 54" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
];

export function EngineeringFocus() {
  return (
    <section id="engineering" className="relative py-28 md:py-36">
      <div className="absolute inset-0 grid-overlay-fine opacity-[0.10] pointer-events-none" aria-hidden />
      <div className="shell">
        <SectionHeader
          index="07 / ENGINEERING"
          eyebrow="ENGINEERING FOCUS"
          title={
            <>
              Discipline at the level
              <span className="block text-text-secondary">of every subsystem.</span>
            </>
          }
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {BLOCKS.map((b) => (
            <article key={b.code} className="panel hud-corner p-7 grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="micro text-text-muted">{b.code}</span>
                  <span className="h-px w-6 bg-signal-blue/60" />
                  <span className="micro text-signal-cyan/80">SUBSYSTEM</span>
                </div>
                <h3 className="mt-4 font-display text-h4 text-text-primary leading-tight">{b.title}</h3>
                <p className="mt-3 text-body text-text-secondary max-w-prose">{b.body}</p>
              </div>
              <div className="col-span-12 lg:col-span-5">
                <div className="panel-deep p-3 h-32">{b.diagram}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
