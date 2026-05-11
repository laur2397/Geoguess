'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

const NAV = [
  { label: 'Overview', href: '#overview' },
  { label: 'Inspection', href: '#inspection' },
  { label: 'Specifications', href: '#specifications' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Interface', href: '#interface' },
  { label: 'Engineering', href: '#engineering' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-md border-b border-border-blue/30'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="shell flex h-16 items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/60 rounded-sm"
          aria-label="DROM — Home"
        >
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-mono text-label uppercase text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <span className="micro text-text-muted hidden xl:inline">SECURE PRODUCT BRIEF</span>
          <a href="#technical-brief" className="btn-primary">
            Request Brief
          </a>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 border border-border-blue/40 rounded-sm text-text-secondary"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="relative block w-4 h-2.5">
            <span className="absolute inset-x-0 top-0 h-px bg-current" />
            <span className="absolute inset-x-0 bottom-0 h-px bg-current" />
          </span>
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="lg:hidden border-t border-border-blue/30 bg-ink-950/95 backdrop-blur">
          <ul className="shell flex flex-col py-4 gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-label uppercase text-text-secondary hover:text-text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <a href="#technical-brief" onClick={() => setOpen(false)} className="btn-primary w-full">
                Request Brief
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
