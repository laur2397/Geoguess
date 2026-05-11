'use client';

const FEATURES = [
  { label: 'COMPACT FRAME', pos: 'top-[18%] left-[6%]', side: 'right' as const },
  { label: 'PRECISION CONTROL', pos: 'top-[18%] right-[6%]', side: 'left' as const },
  { label: 'RAPID INTEGRATION', pos: 'bottom-[20%] left-[6%]', side: 'right' as const },
  { label: 'OPERATIONAL MOBILITY', pos: 'bottom-[20%] right-[6%]', side: 'left' as const },
];

export function FeatureCallouts() {
  return (
    <div className="absolute inset-0 hidden md:block">
      {FEATURES.map((f) => (
        <div key={f.label} className={`absolute ${f.pos}`}>
          <div className="flex items-center gap-2">
            {f.side === 'right' && <span className="h-px w-12 bg-signal-blue/60" />}
            <span className="font-mono text-label uppercase tracking-widest text-text-primary">
              {f.label}
            </span>
            {f.side === 'left' && <span className="h-px w-12 bg-signal-blue/60" />}
          </div>
          <div className={`mt-1 ${f.side === 'right' ? '' : 'text-right'}`}>
            <span className="font-mono text-micro text-text-muted tabular-nums">
              ◦ ◦ ◦
            </span>
          </div>
        </div>
      ))}

      {/* Tiny center anchor */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-signal-cyan/90 shadow-[0_0_18px_rgba(0,174,239,0.7)]"
      />
    </div>
  );
}
