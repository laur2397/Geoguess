import { SectionHeader } from './SectionHeader';
import { IconMobility, IconPrecision, IconIntegration, IconSecurity } from '@/components/ui/Icons';

const CAPS = [
  {
    icon: <IconMobility />,
    label: 'MOBILITY',
    title: 'Mobility',
    body: 'Compact form factor for agile deployment and maneuverability.',
  },
  {
    icon: <IconPrecision />,
    label: 'PRECISION CONTROL',
    title: 'Precision Control',
    body: 'Designed for stable handling and responsive command input.',
  },
  {
    icon: <IconIntegration />,
    label: 'RAPID INTEGRATION',
    title: 'Rapid Integration',
    body: 'Structured for fast adoption into tactical workflows.',
  },
  {
    icon: <IconSecurity />,
    label: 'ENHANCED SECURITY',
    title: 'Enhanced Security',
    body: 'Built around controlled access, operational reliability and secure system logic.',
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="relative py-28 md:py-36">
      <div className="shell">
        <SectionHeader
          index="05 / CAPABILITIES"
          eyebrow="OPERATIONAL CAPABILITIES"
          title={
            <>
              Four pillars of
              <span className="block text-text-secondary">tactical readiness.</span>
            </>
          }
        />

        <div className="mt-16 grid gap-px bg-border-subtle md:grid-cols-2 lg:grid-cols-4 border border-border-blue/30 rounded-sm overflow-hidden">
          {CAPS.map((c, i) => (
            <article
              key={c.title}
              className="group relative bg-ink-900/80 p-7 transition-colors hover:bg-ink-850"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="micro text-text-muted">/ {String(i + 1).padStart(2, '0')}</span>
                <span className="text-signal-blue/90">{c.icon}</span>
              </div>
              <h3 className="font-display text-h5 text-text-primary leading-tight">{c.title}</h3>
              <p className="mt-3 text-body text-text-secondary">{c.body}</p>

              <span
                aria-hidden
                className="absolute left-7 right-7 bottom-7 h-px bg-gradient-to-r from-signal-blue/40 to-transparent
                  scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
