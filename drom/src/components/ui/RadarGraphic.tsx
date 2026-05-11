'use client';

import { cn } from '@/lib/cn';

export function RadarGraphic({ className, size = 220 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden
      className={cn('relative pointer-events-none', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="radarFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(29,111,255,0.18)" />
            <stop offset="60%" stopColor="rgba(29,111,255,0.04)" />
            <stop offset="100%" stopColor="rgba(29,111,255,0)" />
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(0,174,239,0)" />
            <stop offset="100%" stopColor="rgba(0,174,239,0.45)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill="url(#radarFade)" />
        {[20, 45, 70, 95].map((r) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="rgba(80,140,255,0.18)"
            strokeWidth="0.6"
          />
        ))}
        <line x1="100" y1="2" x2="100" y2="198" stroke="rgba(80,140,255,0.12)" strokeWidth="0.5" />
        <line x1="2" y1="100" x2="198" y2="100" stroke="rgba(80,140,255,0.12)" strokeWidth="0.5" />
        <g className="origin-center" style={{ transformOrigin: '100px 100px' }}>
          <g className="animate-sweep">
            <path d="M100 100 L100 2 A98 98 0 0 1 196 110 Z" fill="url(#sweepGrad)" opacity="0.55" />
          </g>
        </g>
        <circle cx="100" cy="100" r="2" fill="rgba(0,174,239,0.9)" />
        <circle cx="60" cy="80" r="1.4" fill="rgba(244,247,250,0.7)" />
        <circle cx="138" cy="120" r="1.4" fill="rgba(244,247,250,0.55)" />
        <circle cx="115" cy="55" r="1.2" fill="rgba(244,247,250,0.45)" />
      </svg>
    </div>
  );
}
