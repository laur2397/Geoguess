import { SectionHeader } from './SectionHeader';
import { TechnicalCard } from '@/components/ui/TechnicalCard';
import { IconStructure, IconControl, IconIntegration } from '@/components/ui/Icons';

const CARDS = [
  {
    icon: <IconStructure />,
    label: 'COMPACT ARCHITECTURE',
    title: 'Compact Architecture',
    body:
      'A disciplined form factor designed for portability, structural clarity and efficient handling.',
  },
  {
    icon: <IconControl />,
    label: 'PRECISION-ORIENTED CONTROL',
    title: 'Precision-Oriented Control',
    body:
      'A control-focused platform concept built around operator clarity and responsive system behavior.',
  },
  {
    icon: <IconIntegration />,
    label: 'RAPID OPERATIONAL INTEGRATION',
    title: 'Rapid Operational Integration',
    body:
      'A product structure intended to support faster evaluation, deployment planning and workflow integration.',
  },
];

export function PlatformOverview() {
  return (
    <section id="overview" className="relative py-28 md:py-36">
      <div className="absolute inset-0 grid-overlay opacity-[0.10] pointer-events-none" aria-hidden />
      <div className="shell">
        <SectionHeader
          index="02 / OVERVIEW"
          eyebrow="PLATFORM OVERVIEW"
          title={
            <>
              Engineered for controlled mobility
              <span className="block text-text-secondary">
                and rapid operational integration.
              </span>
            </>
          }
          intro={
            <>
              DROM is a compact aerial platform designed for controlled mobility, precise handling
              and rapid operational integration. Its architecture supports deployment in scenarios
              where size, responsiveness and secure control are critical.
            </>
          }
        />

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <TechnicalCard
              key={c.title}
              index={`/ ${String(i + 1).padStart(2, '0')}`}
              label={c.label}
              title={c.title}
              body={c.body}
              icon={c.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
