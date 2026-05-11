import { Logo } from '@/components/ui/Logo';
import { HUDLine } from '@/components/ui/HUDLine';

const COLUMNS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Overview', href: '#overview' },
      { label: 'Specifications', href: '#specifications' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Engineering', href: '#engineering' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Technical Brief', href: '#technical-brief' },
      { label: 'Deployment Context', href: '#deployment' },
      { label: 'Interface Concept', href: '#interface' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'MDH-X', href: '#' },
      { label: 'Press Inquiries', href: '#technical-brief' },
      { label: 'Contact Product Team', href: '#technical-brief' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border-blue/25 bg-ink-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-blue/40 to-transparent" />
      <div className="shell pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-prose text-body text-text-secondary">
              DROM is a compact aerial platform engineered for mobility, precision control and
              rapid tactical integration in demanding operational environments.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="micro text-text-muted">SYSTEM STATUS</span>
              <span className="flex items-center gap-2 font-mono text-micro text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
                ONLINE
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="label mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      className="text-body text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h4 className="label mb-4">Contact</h4>
            <p className="text-body text-text-secondary">
              For institutional inquiries and procurement, request the technical brief.
            </p>
            <a href="#technical-brief" className="mt-4 inline-block btn-ghost">
              Contact
            </a>
          </div>
        </div>

        <HUDLine className="mt-14" />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 micro text-text-muted">
            <span>DROM / ADVANCED AERIAL SYSTEM</span>
            <span aria-hidden>·</span>
            <span>DEFENSE &amp; SECURITY APPLICATIONS</span>
            <span aria-hidden>·</span>
            <span>BY MDH-X</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 micro text-text-muted">
            <a href="#" className="hover:text-text-secondary transition-colors">LEGAL</a>
            <a href="#" className="hover:text-text-secondary transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-text-secondary transition-colors">TERMS</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
