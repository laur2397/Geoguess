import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)} aria-label="DROM">
      <svg
        width="22"
        height="22"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M4 8 L16 22 L28 8"
          stroke="url(#logoGrad)"
          strokeWidth="2.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        <path
          d="M10 8 L16 16 L22 8"
          stroke="rgba(244,247,250,0.9)"
          strokeWidth="1.4"
          strokeLinecap="square"
          fill="none"
        />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1D6FFF" />
            <stop offset="1" stopColor="#00AEEF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="leading-none">
        <span className="font-display text-[1.05rem] tracking-[0.18em] font-semibold text-text-primary">
          DROM
        </span>
        <span className="ml-2 font-mono text-micro text-text-muted">/ MDH-X</span>
      </div>
    </div>
  );
}
